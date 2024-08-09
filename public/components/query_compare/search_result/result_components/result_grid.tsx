/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */


import {
  EuiSmallButtonIcon,
  EuiDescriptionList,
  EuiDescriptionListDescription,
  EuiDescriptionListTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiIconTip,
  EuiMark,
  EuiPopover,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import _, { uniqueId } from 'lodash';
import React, { useState } from 'react';

import { useSearchRelevanceContext } from '../../../../contexts';
import { DocumentRank } from '../../../../contexts/utils';
import { Document, SearchResults } from '../../../../types/index';

import './result_grid.scss';

interface ResultGridComponentProps {
  comparedDocumentsRank: DocumentRank;
  queryResult: SearchResults;
  resultNumber: number;
}

export const ResultGridComponent = ({
  comparedDocumentsRank,
  queryResult,
  resultNumber,
}: ResultGridComponentProps) => {
  const { selectedIndex1, selectedIndex2 } = useSearchRelevanceContext();

  const GetExpColapTd = (docSource: IDocType) => {
    const [isResultDetailOpen, setIsResultDetailOpen] = useState(false);
    const closeResultDetail = () => setIsResultDetailOpen(false);

    // Click on expand/collapse button
    const toggleDetails = () => {
      setIsResultDetailOpen(!isResultDetailOpen);
    };

    return (
      <td className="osdDocTableCell__toggleDetails" key={uniqueId('grid-td-')}>
        <EuiPopover
          button={
            <EuiSmallButtonIcon
              aria-label="Toggle details"
              className="euiButtonIcon euiButtonIcon--text"
              iconType={isResultDetailOpen ? 'minimize' : 'expand'}
              onClick={toggleDetails}
            />
          }
          isOpen={isResultDetailOpen}
          closePopover={closeResultDetail}
          anchorPosition="leftUp"
        >
          <EuiText size="m" className="eui-yScroll osdDocTableCell__detailsExpanded">
            {_.toPairs(docSource).map((entry: string[]) => {
              return (
                <span key={uniqueId('popover-text-')}>
                  <EuiMark>{`${entry[0]}: `}</EuiMark>
                  {_.isObject(entry[1]) ? JSON.stringify(entry[1]) : entry[1]} <br />
                </span>
              );
            })}
          </EuiText>
        </EuiPopover>
      </td>
    );
  };

  const getDlTmpl = (doc: Document) => {
    const sourceFields = Object.assign(doc._source, doc.fields);

    return (
      <div className="truncate-by-height">
        <span>
          <EuiDescriptionList
            className="source truncate-by-height"
            type="inline"
            textStyle="normal"
            compressed={true}
          >
            {_.toPairs(sourceFields).map((entry: string[]) => {
              return (
                <span key={uniqueId('grid-dt-dd-')}>
                  <EuiDescriptionListTitle className="osdDescriptionListFieldTitle">{`${entry[0]}`}</EuiDescriptionListTitle>
                  <EuiDescriptionListDescription>
                    <span>{_.isObject(entry[1]) ? JSON.stringify(entry[1]) : entry[1]} </span>
                  </EuiDescriptionListDescription>
                </span>
              );
            })}
          </EuiDescriptionList>
        </span>
      </div>
    );
  };

  const getTdTmpl = (conf: { clsName: string; content: React.ReactDOM | string }) => {
    const { clsName, content } = conf;
    return (
      <td key={uniqueId('datagrid-cell-')} className={clsName}>
        {typeof content === 'boolean' ? String(content) : content}
      </td>
    );
  };

  const getRankComparison = (documentId: string, documentRank: number) => {
    const comparedRank = comparedDocumentsRank[documentId];

    // No match result in comparison set
    if (typeof comparedRank !== 'number') {
      return (
        <EuiText>
          <span
            style={{ color: '#69707D', fontSize: '12px', fontWeight: '400', lineHeight: '21px' }}
          >
            Not applicable
          </span>{' '}
          <EuiIconTip
            aria-label="IconTip"
            size="m"
            type="questionInCircle"
            color="#343741"
            content={
              selectedIndex1 === selectedIndex2 ? (
                <span>
                  Not in <strong>Results {resultNumber === 1 ? 2 : 1}</strong>
                </span>
              ) : (
                <span>No cross-references when using different indexes</span>
              )
            }
          />
        </EuiText>
      );
    }

    const rankDifference = documentRank - comparedRank;
    if (rankDifference === 0) {
      return (
        <EuiText>
          <span className="comparison-rank " style={{ color: '#343741' }}>
            No change
          </span>
        </EuiText>
      );
    } else if (rankDifference < 0) {
      return (
        <EuiText>
          <span className="comparison-rank " style={{ color: '#017D73' }}>
            <EuiIcon type="sortUp" /> Up {Math.abs(rankDifference)}
          </span>
        </EuiText>
      );
    } else if (rankDifference > 0) {
      return (
        <EuiText>
          <span className="comparison-rank " style={{ color: '#BD271E' }}>
            <EuiIcon type="sortDown" /> Down {rankDifference}
          </span>
        </EuiText>
      );
    }
  };

  const getRankColumn = (documentId: string, documentRank: number) => {
    return (
      <td key={`${resultNumber}-${documentId}`}>
        <EuiFlexGroup style={{ width: '150px' }} direction="column" justifyContent="center">
          <EuiFlexItem>
            <EuiTitle size="xs">
              <h1
                style={{
                  fontWeight: '300',
                  fontSize: '27px',
                  lineHeight: '36px',
                }}
              >
                {documentRank}
              </h1>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>{getRankComparison(documentId, documentRank)}</EuiFlexItem>
        </EuiFlexGroup>
      </td>
    );
  };

  const getTds = (document: Document, documentRank: number) => {
    const cols = [];
    const fieldClsName = 'eui-textBreakAll eui-textBreakWord';
    const timestampClsName = 'eui-textNoWrap';

    // Get rank index column
    cols.push(getRankColumn(document._id, documentRank));

    // No field is selected
    const _sourceFieldsLikeDOM = getDlTmpl(document);
    cols.push(
      getTdTmpl({
        clsName: fieldClsName,
        content: _sourceFieldsLikeDOM,
      })
    );

    // Add detail toggling column
    cols.push(GetExpColapTd(document._source));

    return cols;
  };

  const resultGrid = () => {
    return (
      <>
        {queryResult.hits.hits.map((document: Document, documentRank: number) => {
          return (
            <tr className="osdDocTable__row" key={uniqueId('documentId-')}>
              {getTds(document, documentRank + 1)}
            </tr>
          );
        })}
      </>
    );
  };

  return (
    <div className="dscTable dscTableFixedScroll">
      <table className="osd-table table" data-test-subj="docTable">
        <tbody>{resultGrid()}</tbody>
      </table>
    </div>
  );
};
