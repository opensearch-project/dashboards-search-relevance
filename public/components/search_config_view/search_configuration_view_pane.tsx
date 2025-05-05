import React from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiText,
  EuiCodeBlock,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
} from '@elastic/eui';

interface SearchConfigurationViewProps {
  name: string;
  index: string;
  queryBody: string;
  searchPipeline?: string;
  searchTemplate?: string;
}

export const SearchConfigurationViewPane: React.FC<SearchConfigurationViewProps> = ({
  name,
  index,
  queryBody,
  searchPipeline,
  searchTemplate,
}) => {
  const formatJson = (json: string) => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };

  return (
    <EuiForm>
      <EuiFormRow
        label="Search Configuration Name"
        fullWidth
      >
        <EuiText>{name}</EuiText>
      </EuiFormRow>

      <EuiFormRow
        label="Index"
        fullWidth
      >
        <EuiText>{index}</EuiText>
      </EuiFormRow>

      <EuiFormRow
        label="Query Body"
        fullWidth
      >
        <EuiCodeBlock
          language="json"
          fontSize="m"
          paddingSize="m"
          isCopyable={true}
          whiteSpace="pre"
        >
          {formatJson(queryBody)}
        </EuiCodeBlock>
      </EuiFormRow>

      {(searchPipeline || searchTemplate) && (
        <EuiDescriptionList type="column" compressed>
          {searchPipeline && (
            <>
              <EuiDescriptionListTitle>Search Pipeline</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>{searchPipeline}</EuiDescriptionListDescription>
            </>
          )}
          {searchTemplate && (
            <>
              <EuiDescriptionListTitle>Search Template</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>{searchTemplate}</EuiDescriptionListDescription>
            </>
          )}
        </EuiDescriptionList>
      )}
    </EuiForm>
  );
}; 