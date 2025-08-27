/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ResultItemsProps {
  items: any[];
  resultNum: number;
  imageFieldName?: string;
  displayField: string;
  getStatusColor: (item: any, resultNum: number) => string;
  handleItemClick: (item: any, event: React.MouseEvent) => void;
  result1ItemsRef: React.MutableRefObject<{ [key: string]: HTMLDivElement }>;
  result2ItemsRef: React.MutableRefObject<{ [key: string]: HTMLDivElement }>;
  sizeMultiplier: number;
}

export const ResultItems: React.FC<ResultItemsProps> = ({
  items,
  resultNum,
  imageFieldName,
  displayField,
  getStatusColor,
  handleItemClick,
  result1ItemsRef,
  result2ItemsRef,
  sizeMultiplier,
}) => {
  const imageSize = 32 * sizeMultiplier;
  const imageSizeClass = `w-${Math.min(sizeMultiplier * 4, 64)} h-${Math.min(sizeMultiplier * 4, 64)}`;
  const maxLines = sizeMultiplier;
  return (
    <div id={`result${resultNum}-items`}>
      {items.map((item, index) => (
        <div
          key={`r${resultNum}-${index}`}
          id={`r${resultNum}-item-${item._id}`}
          ref={(el) => {
            if (el) {
              (resultNum === 1 ? result1ItemsRef : result2ItemsRef).current[item._id] = el;
            }
          }}
          className={`flex ${
            resultNum === 1 ? 'flex-row-reverse' : ''
          } items-center mb-2 hover:bg-gray-100 p-1 rounded cursor-pointer`}
          onClick={(event) => handleItemClick(item, event)}
        >
          <div
            className={`w-8 h-8 rounded-full ${getStatusColor(
              item,
              resultNum
            )} flex items-center justify-center font-bold ${
              resultNum === 1 ? 'ml-2' : 'mr-2'
            } flex-shrink-0`}
          >
            {item.rank}
          </div>
          <div className={`${resultNum === 1 ? 'ml-2' : 'mr-2'} flex-shrink-0`} style={{ width: `${imageSize}px`, height: `${imageSize}px` }}>
            {imageFieldName &&
            item[imageFieldName] &&
            item[imageFieldName].match(/\.(jpg|jpeg|png|gif|svg|webp)($|\?)/i) ? (
              <img
                width={imageSize}
                height={imageSize}
                src={item[imageFieldName]}
                className="object-contain rounded"
                style={{ width: `${imageSize}px`, height: `${imageSize}px` }}
              />
            ) : (
              <div className="rounded" style={{ width: `${imageSize}px`, height: `${imageSize}px` }} />
            )}
          </div>
          <div 
            className="font-mono text-xs break-words overflow-hidden flex-grow"
            style={{ 
              display: '-webkit-box',
              WebkitLineClamp: maxLines,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {item.highlight && item.highlight[displayField] ? (
              <span dangerouslySetInnerHTML={{ 
                __html: item.highlight[displayField][0].replace(/<em>/g, '<mark style="background-color: yellow;">').replace(/<\/em>/g, '</mark>') 
              }} />
            ) : (
              item[displayField] || item._id
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
