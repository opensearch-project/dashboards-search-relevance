/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
} from '@elastic/eui';
import _, { uniqueId } from 'lodash';

import { IDocType, SearchResults, Document } from '../../../../types/index';
import { DocumentRank } from '../../../../contexts/utils';
import { useSearchRelevanceContext } from '../../../../contexts';

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

  const getExpColapTd = () => {
    return (
      <td className="osdDocTableCell__toggleDetails" key={uniqueId('grid-td-')}>
        <EuiButtonIcon className="euiButtonIcon euiButtonIcon--text" iconType="arrowLeft" />
      </td>
    );
  };

  const getDlTmpl = (doc: Document) => {
    const sourceFields = Object.assign(doc._source, doc.fields);

    return (
      <div className="truncate-by-height">
        <span>
          <dl className="source truncate-by-height">
            {_.toPairs(sourceFields).map((entry: string[]) => {
              return (
                <span key={uniqueId('grid-dt-dd-')}>
                  <dt>{`${entry[0]}:`}</dt>
                  <dd>
                    <span>{_.isObject(entry[1]) ? JSON.stringify(entry[1]) : entry[1]} </span>
                  </dd>
                </span>
              );
            })}
          </dl>
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

    // // Add detail toggling column
    // // cols.unshift(getExpColapTd());
    // cols.push(getExpColapTd());

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
