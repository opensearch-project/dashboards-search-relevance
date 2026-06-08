/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { DataSourceMenu } from '../data_source_menu';

// OSD's getDataSourceMenu() returns a component class; spy on it so we can
// inspect the props we hand to OSD and drive `onSelectedDataSources` from the
// test.
const renderedMenu = jest.fn<React.ReactElement | null, [any]>();

const makeDataSourceManagement = () => ({
  ui: {
    getDataSourceMenu: jest.fn(() => (props: any) => {
      renderedMenu(props);
      return (
        <div data-test-subj="osd-data-source-menu">
          <button
            type="button"
            data-test-subj="osd-pick-foo"
            onClick={() => props.componentConfig.onSelectedDataSources([{ id: 'foo-ds' }])}
          >
            pick foo
          </button>
          <button
            type="button"
            data-test-subj="osd-pick-undefined"
            onClick={() => props.componentConfig.onSelectedDataSources([{ id: undefined }])}
          >
            pick undefined
          </button>
          <button
            type="button"
            data-test-subj="osd-pick-empty-list"
            onClick={() => props.componentConfig.onSelectedDataSources([])}
          >
            pick empty
          </button>
        </div>
      );
    }),
    DataSourceSelector: () => null,
  } as any,
});

const baseProps = () => ({
  dataSourceEnabled: true,
  dataSourceManagement: makeDataSourceManagement(),
  savedObjects: { client: { find: jest.fn() } } as any,
  notifications: {
    toasts: { addDanger: jest.fn(), addSuccess: jest.fn(), addError: jest.fn() },
  } as any,
  setActionMenu: jest.fn(),
  dataSourceId: undefined as string | undefined,
  setDataSourceId: jest.fn(),
});

describe('DataSourceMenu', () => {
  beforeEach(() => {
    renderedMenu.mockClear();
  });

  it('renders nothing when multi-data-source is disabled', () => {
    const { container } = render(
      <DataSourceMenu {...baseProps()} dataSourceEnabled={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when the dataSourceManagement plugin is absent', () => {
    const { container } = render(
      <DataSourceMenu {...baseProps()} dataSourceManagement={undefined} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('mounts the OSD DataSourceMenu with DataSourceSelectable and no active option when no id is supplied', () => {
    const props = baseProps();
    const { getByTestId } = render(<DataSourceMenu {...props} />);

    expect(getByTestId('osd-data-source-menu')).toBeInTheDocument();
    expect(props.dataSourceManagement!.ui.getDataSourceMenu).toHaveBeenCalledTimes(1);

    const menuProps = renderedMenu.mock.calls[0][0];
    expect(menuProps.componentType).toBe('DataSourceSelectable');
    expect(menuProps.setMenuMountPoint).toBe(props.setActionMenu);
    expect(menuProps.componentConfig.activeOption).toBeUndefined();
    expect(menuProps.componentConfig.savedObjects).toBe(props.savedObjects.client);
    expect(menuProps.componentConfig.notifications).toBe(props.notifications);
  });

  it('seeds activeOption from the supplied dataSourceId', () => {
    render(<DataSourceMenu {...baseProps()} dataSourceId="foo-ds" />);
    const menuProps = renderedMenu.mock.calls[0][0];
    expect(menuProps.componentConfig.activeOption).toEqual([{ id: 'foo-ds' }]);
  });

  it('forwards a chosen data source id via setDataSourceId', () => {
    const props = baseProps();
    const { getByTestId } = render(<DataSourceMenu {...props} />);

    fireEvent.click(getByTestId('osd-pick-foo'));

    expect(props.setDataSourceId).toHaveBeenCalledWith('foo-ds');
    expect(props.notifications.toasts.addDanger).not.toHaveBeenCalled();
  });

  it('shows a danger toast and does not update state when the picker yields an undefined id', () => {
    const props = baseProps();
    const { getByTestId } = render(<DataSourceMenu {...props} />);

    fireEvent.click(getByTestId('osd-pick-undefined'));

    expect(props.setDataSourceId).not.toHaveBeenCalled();
    expect(props.notifications.toasts.addDanger).toHaveBeenCalledWith(
      'Unable to set data source.'
    );
  });

  it('shows a danger toast when the picker yields no event at all', () => {
    const props = baseProps();
    const { getByTestId } = render(<DataSourceMenu {...props} />);

    fireEvent.click(getByTestId('osd-pick-empty-list'));

    expect(props.setDataSourceId).not.toHaveBeenCalled();
    expect(props.notifications.toasts.addDanger).toHaveBeenCalledWith(
      'Unable to set data source.'
    );
  });

  it('passes a dataSourceFilter that rejects AnalyticEngine and unsupported versions', () => {
    render(<DataSourceMenu {...baseProps()} />);
    const menuProps = renderedMenu.mock.calls[0][0];
    const filter = menuProps.componentConfig.dataSourceFilter;

    const ds = (version: string, engineType?: string) => ({
      attributes: { dataSourceVersion: version, dataSourceEngineType: engineType },
    });

    expect(filter(ds('2.12.0', 'OpenSearch'))).toBe(true);
    expect(filter(ds('2.12.0', 'AnalyticEngine'))).toBe(false);
    expect(filter(ds('2.6.0', 'OpenSearch'))).toBe(false);
  });

  it('does not remount OSD on parent re-renders when stable props are unchanged (dataSourceId changes only update internal state)', () => {
    // The wrapper memoizes its output so OSD's menu keeps its loaded options
    // across navigation. Re-rendering with a different dataSourceId must NOT
    // trigger another getDataSourceMenu() factory call.
    const props = baseProps();
    const { rerender } = render(<DataSourceMenu {...props} />);

    expect(props.dataSourceManagement!.ui.getDataSourceMenu).toHaveBeenCalledTimes(1);

    rerender(<DataSourceMenu {...props} dataSourceId="foo-ds" />);
    rerender(<DataSourceMenu {...props} dataSourceId="bar-ds" />);

    expect(props.dataSourceManagement!.ui.getDataSourceMenu).toHaveBeenCalledTimes(1);
    // And OSD's menu is rendered exactly once — the cached element is reused.
    expect(renderedMenu).toHaveBeenCalledTimes(1);
  });

  it('rebuilds the menu when stable identity props change (e.g. dataSourceManagement swapped)', () => {
    const first = baseProps();
    const { rerender } = render(<DataSourceMenu {...first} />);
    expect(first.dataSourceManagement!.ui.getDataSourceMenu).toHaveBeenCalledTimes(1);

    const second = { ...first, dataSourceManagement: makeDataSourceManagement() };
    rerender(<DataSourceMenu {...second} />);

    expect(second.dataSourceManagement!.ui.getDataSourceMenu).toHaveBeenCalledTimes(1);
    expect(renderedMenu).toHaveBeenCalledTimes(2);
  });
});
