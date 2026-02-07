/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SearchConfigurationForm } from '../components/search_configuration_form';

const basicProps = {
  name: 'Test',
  setName: jest.fn(),
  nameError: '',
  validateName: jest.fn(),
  query: '',
  setQuery: jest.fn(),
  queryError: '',
  setQueryError: jest.fn(),
  searchTemplate: '',
  setSearchTemplate: jest.fn(),
  indexOptions: [],
  selectedIndex: [],
  setSelectedIndex: jest.fn(),
  isLoadingIndexes: false,
  pipelineOptions: [],
  selectedPipeline: [],
  setSelectedPipeline: jest.fn(),
  isLoadingPipelines: false,
};

describe('SearchConfigurationForm Basic', () => {
  it('should render without crashing', () => {
    render(<SearchConfigurationForm {...basicProps} />);
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
  });
});
