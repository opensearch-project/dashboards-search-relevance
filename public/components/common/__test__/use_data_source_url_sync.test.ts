/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act } from '@testing-library/react';
import { useDataSourceUrlSync } from '../datasource_utils';

const makeHistory = () => ({ replace: jest.fn() });

const loc = (pathname: string, search = '') => ({ pathname, search, hash: '' });

describe('useDataSourceUrlSync', () => {
  describe('seeding from the URL', () => {
    it('reads dataSourceId from the URL on mount when MDS is enabled', () => {
      const history = makeHistory();
      const { result } = renderHook(() =>
        useDataSourceUrlSync(true, history, loc('/querySet', '?dataSourceId=foo-ds'))
      );
      expect(result.current[0]).toBe('foo-ds');
    });

    it('returns undefined when no dataSourceId is in the URL', () => {
      const history = makeHistory();
      const { result } = renderHook(() =>
        useDataSourceUrlSync(true, history, loc('/querySet'))
      );
      expect(result.current[0]).toBeUndefined();
    });

    it('ignores a stale ?dataSourceId=… from a prior session when MDS is disabled', () => {
      // The server-side dataSource plugin isn't loaded to route the id in
      // single-cluster mode, so we must not seed state with it.
      const history = makeHistory();
      const { result } = renderHook(() =>
        useDataSourceUrlSync(false, history, loc('/querySet', '?dataSourceId=foo-ds'))
      );
      expect(result.current[0]).toBeUndefined();
    });
  });

  describe('writing back to the URL', () => {
    it('does not call history.replace on initial mount when state already matches the URL', () => {
      const history = makeHistory();
      renderHook(() =>
        useDataSourceUrlSync(true, history, loc('/querySet', '?dataSourceId=foo-ds'))
      );
      expect(history.replace).not.toHaveBeenCalled();
    });

    it('writes ?dataSourceId=… when the user picks a new source', () => {
      const history = makeHistory();
      const location = loc('/querySet');
      const { result } = renderHook(() =>
        useDataSourceUrlSync(true, history, location)
      );

      act(() => {
        result.current[1]('foo-ds');
      });

      expect(history.replace).toHaveBeenCalledWith({
        pathname: '/querySet',
        search: '?dataSourceId=foo-ds',
        hash: '',
      });
    });

    it('removes the param when the user clears the selection', () => {
      const history = makeHistory();
      const location = loc('/querySet', '?dataSourceId=foo-ds');
      const { result } = renderHook(() =>
        useDataSourceUrlSync(true, history, location)
      );

      act(() => {
        result.current[1](undefined);
      });

      expect(history.replace).toHaveBeenCalledWith({
        pathname: '/querySet',
        search: '',
        hash: '',
      });
    });

    it('preserves other query params when stamping dataSourceId', () => {
      const history = makeHistory();
      const location = loc('/querySet', '?foo=bar');
      const { result } = renderHook(() =>
        useDataSourceUrlSync(true, history, location)
      );

      act(() => {
        result.current[1]('foo-ds');
      });

      const call = history.replace.mock.calls[0][0];
      const params = new URLSearchParams(call.search);
      expect(params.get('foo')).toBe('bar');
      expect(params.get('dataSourceId')).toBe('foo-ds');
    });

    it('does not write to the URL when MDS is disabled', () => {
      const history = makeHistory();
      const { result } = renderHook(() =>
        useDataSourceUrlSync(false, history, loc('/querySet'))
      );

      act(() => {
        // Even if something tries to set an id, the effect must short-circuit.
        result.current[1]('foo-ds');
      });

      expect(history.replace).not.toHaveBeenCalled();
    });
  });

  describe('navigation behavior', () => {
    it('re-stamps the URL after a tab click drops the dataSourceId param', () => {
      // Tab clicks call history.push(pathname) with a bare string, which
      // react-router treats as { pathname, search: '', hash: '' } — dropping
      // the param. The effect must re-stamp it onto the new URL because we
      // include `location` in the deps.
      const history = makeHistory();

      const { result, rerender } = renderHook(
        ({ location }: { location: any }) =>
          useDataSourceUrlSync(true, history, location),
        { initialProps: { location: loc('/querySet', '?dataSourceId=foo-ds') } }
      );
      expect(result.current[0]).toBe('foo-ds');
      expect(history.replace).not.toHaveBeenCalled();

      // Simulate `history.push(Routes.JudgmentListing)` — same hook tree, new
      // location with the param stripped.
      rerender({ location: loc('/judgment') });

      expect(history.replace).toHaveBeenCalledTimes(1);
      expect(history.replace).toHaveBeenCalledWith({
        pathname: '/judgment',
        search: '?dataSourceId=foo-ds',
        hash: '',
      });
    });

    it('does not re-stamp when navigating to a URL that already has the right param', () => {
      const history = makeHistory();

      const { rerender } = renderHook(
        ({ location }: { location: any }) =>
          useDataSourceUrlSync(true, history, location),
        { initialProps: { location: loc('/querySet', '?dataSourceId=foo-ds') } }
      );

      rerender({ location: loc('/judgment', '?dataSourceId=foo-ds') });

      expect(history.replace).not.toHaveBeenCalled();
    });

    it('does not loop after writing — the effect short-circuits once the URL is in sync', () => {
      const history = makeHistory();
      let location = loc('/querySet');

      const { result, rerender } = renderHook(
        ({ location: l }: { location: any }) =>
          useDataSourceUrlSync(true, history, l),
        { initialProps: { location } }
      );

      // User picks a source — effect writes to the URL.
      act(() => {
        result.current[1]('foo-ds');
      });
      expect(history.replace).toHaveBeenCalledTimes(1);

      // Simulate the URL change propagating back into the hook.
      location = history.replace.mock.calls[0][0];
      rerender({ location });

      // The effect must NOT fire again — current === dataSourceId now.
      expect(history.replace).toHaveBeenCalledTimes(1);
    });
  });
});
