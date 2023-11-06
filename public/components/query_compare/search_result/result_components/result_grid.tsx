/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiButtonIcon,
  EuiLink,
  EuiPanel,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiIcon,
  EuiIconTip,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiMark,
  EuiPopover,
} from '@elastic/eui';
import _, { uniqueId } from 'lodash';

import { IDocType, SearchResults, Document } from '../../../../types/index';
import { DocumentRank } from '../../../../contexts/utils';
import { useSearchRelevanceContext } from '../../../../contexts';

import './result_grid.scss';
// import { unique } from 'vega-lite/src';

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
    return (
      <td className="osdDocTableCell__toggleDetails" key={uniqueId('grid-td-')}>
        <EuiPopover
          button={
            <EuiButtonIcon
              aria-label="Toggle details"
              className="euiButtonIcon euiButtonIcon--text"
              iconType={isResultDetailOpen ? 'minimize' : 'expand'}
              onClick={() => {
                setIsResultDetailOpen(!isResultDetailOpen);
              }}
            />
          }
          isOpen={isResultDetailOpen}
          closePopover={closeResultDetail}
          anchorPosition="leftUp"
        >
          {/* <EuiText size="s" style={{ width: 300, height: 'fit-content', wordWrap: 'break-word' }}>
            {JSON.stringify(docSource)}
          </EuiText> */}
          <EuiText
            size="m"
            className="eui-yScroll"
            style={{
              minWidth: 325,
              width: '35vw',
              wordWrap: 'break-word',
              height: 220,
              overflowY: 'auto',
            }}
          >
            {_.toPairs(docSource).map((entry: string[]) => {
              return (
                <>
                  <EuiMark>{`${entry[0]}: `}</EuiMark>
                  {_.isObject(entry[1]) ? JSON.stringify(entry[1]) : entry[1]} <br />
                </>
              );
            })}
          </EuiText>
        </EuiPopover>
      </td>
    );
  };

  const getDlTmpl = (doc: IDocType) => {
    return (
      <div className="truncate-by-height">
        <span>
          <EuiDescriptionList
            className="source truncate-by-height"
            textStyle="normal"
            compressed={true}
          >
            {_.toPairs(doc).map((entry: string[]) => {
              return (
                <>
                  <EuiDescriptionListTitle className="osdDescriptionListFieldTitle">{`${entry[0]}`}</EuiDescriptionListTitle>
                  <EuiDescriptionListDescription>
                    <span>{_.isObject(entry[1]) ? JSON.stringify(entry[1]) : entry[1]} </span>
                  </EuiDescriptionListDescription>
                </>
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
    const _sourceLikeDOM = getDlTmpl(document._source);
    cols.push(
      getTdTmpl({
        clsName: fieldClsName,
        content: _sourceLikeDOM,
      })
    );

    // // Add detail toggling column
    // // cols.unshift(getExpColapTd());
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

  // useEffect(() => {
  //   console.log('query result changed');
  //   if (!_.isEmpty(queryResult))
  //     setResultGrid(
  //       queryResult.hits.hits.map((doc: any, id: number) => {
  //         return (
  //           <>
  //             <tr className="osdDocTable__row">{getTds(doc._source)}</tr>
  //           </>
  //         );
  //       })
  //     );
  // }, [queryResult]);

  return (
    <div className="dscTable dscTableFixedScroll">
      <table className="osd-table table" data-test-subj="docTable">
        <tbody>{resultGrid()}</tbody>
      </table>
    </div>
  );
};
