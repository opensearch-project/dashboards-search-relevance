/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import './result_grid.scss';
import { EuiButtonIcon, EuiLink, EuiPanel, EuiText } from '@elastic/eui';
import _, { uniqueId } from 'lodash';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { IDocType } from '../../../../types/index';

interface ResultGridComponentProps {
  queryResult: any;
}
export const ResultGridComponent = ({ queryResult }: ResultGridComponentProps) => {
  const [resultGrid, setResultGrid] = useState(<></>);

  const getExpColapTd = () => {
    return (
      <td className="osdDocTableCell__toggleDetails" key={uniqueId('grid-td-')}>
        <EuiButtonIcon className="euiButtonIcon euiButtonIcon--text" iconType="arrowLeft" />
      </td>
    );
  };

  const getDlTmpl = (doc: IDocType) => {
    return (
      <div className="truncate-by-height">
        <span>
          <dl className="source truncate-by-height">
            {_.toPairs(doc).map((entry: string[]) => {
              return (
                <span key={uniqueId('grid-desc')}>
                  <dt>{entry[0]}:</dt>
                  <dd>
                    <span>{entry[1]}</span>
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

  const getTds = (doc: IDocType) => {
    const cols = [];
    const fieldClsName = 'osdDocTableCell__dataField eui-textBreakAll eui-textBreakWord';
    const timestampClsName = 'eui-textNoWrap';

    // No field is selected
    const _sourceLikeDOM = getDlTmpl(doc);
    cols.push(
      getTdTmpl({
        clsName: fieldClsName,
        content: _sourceLikeDOM,
      })
    );

    // Add detail toggling column
    // cols.unshift(getExpColapTd());
    cols.push(getExpColapTd());
    return cols;
  };

  useEffect(() => {
    console.log('query result changed');
    if (!_.isEmpty(queryResult))
      setResultGrid(
        queryResult.hits.hits.map((doc: any, id: number) => {
          return (
            <>
              <tr className="osdDocTable__row">{getTds(doc._source)}</tr>
            </>
          );
        })
      );
  }, [queryResult]);

  return (
    <div className="dscTable dscTableFixedScroll">
      <table className="osd-table table" data-test-subj="docTable">
        <tbody>{resultGrid}</tbody>
      </table>
    </div>
  );
};
