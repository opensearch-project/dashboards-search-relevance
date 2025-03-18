import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiComboBox,
} from "@elastic/eui";
import { SearchConfigOption, SearchConfigFromData } from "./types";
import { mockupSearchConfigOptions } from "../mockup_data";

interface SearchConfigFormProps {
  formData: SearchConfigFromData;
  onChange: (data: SearchConfigFromData) => void;
}

export const SearchConfigForm = ({
                                   formData,
                                   onChange,
                                 }: SearchConfigFormProps) => {
  const handleSearchConfigsChange = (selected: SearchConfigOption[]) => {
    onChange({
      searchConfigs: selected || [],
    });
  };

  return (
    <EuiFlexGroup gutterSize="m" direction="row" style={{ maxWidth: 600 }}>
      <EuiFlexItem grow={4}>
        <EuiFormRow
          label="Search Configurations"
          helpText="Select two or more search configurations"
        >
          <EuiComboBox
            placeholholder="Select search configuration"
            options={mockupSearchConfigOptions}
            selectedOptions={formData.searchConfigs}
            onChange={handleSearchConfigsChange}
            isClearable={true}
            isInvalid={formData.searchConfigs.length === 0}
            multi={true}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
