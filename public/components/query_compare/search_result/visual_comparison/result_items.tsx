import React from 'react';

interface ResultItemsProps {
  items: any[];
  resultNum: number;
  imageFieldName?: string;
  displayField: string;
  getStatusColor: (item: any, resultNum: number) => string;
  handleItemMouseEnter: (item: any, event: React.MouseEvent) => void;
  handleItemMouseLeave: () => void;
  result1ItemsRef: React.MutableRefObject<{ [key: string]: HTMLDivElement }>;
  result2ItemsRef: React.MutableRefObject<{ [key: string]: HTMLDivElement }>;
}

export const ResultItems: React.FC<ResultItemsProps> = ({
  items,
  resultNum,
  imageFieldName,
  displayField,
  getStatusColor,
  handleItemMouseEnter,
  handleItemMouseLeave,
  result1ItemsRef,
  result2ItemsRef,
}) => {
  return (
    <div id={`result${resultNum}-items`}>
      {items.map((item, index) => (
        <div 
          key={`r${resultNum}-${index}`}
          id={`r${resultNum}-item-${item._id}`}
          ref={el => {
            if (el) {
              (resultNum === 1 ? result1ItemsRef : result2ItemsRef).current[item._id] = el;
            }
          }}
          className={`flex ${resultNum === 1 ? 'flex-row-reverse' : ''} items-center mb-2 hover:bg-gray-100 p-1 rounded`}
          onMouseEnter={(event) => handleItemMouseEnter(item, event)}
          onMouseLeave={handleItemMouseLeave}
        >
          <div className={`w-8 h-8 rounded-full ${getStatusColor(item, resultNum)} flex items-center justify-center font-bold ${resultNum === 1 ? 'ml-2' : 'mr-2'} flex-shrink-0`}>
            {item.rank}
          </div>
          <div className={`w-8 h-8 ${resultNum === 1 ? 'ml-2' : 'mr-2'} flex-shrink-0`}>
            {imageFieldName && item[imageFieldName] && item[imageFieldName].match(/\.(jpg|jpeg|png|gif|svg|webp)($|\?)/i) ? (
              <img
                width="32"
                height="32"
                src={item[imageFieldName]}
                className="w-8 h-8 object-cover rounded"
              />
            ) : (
              <div
                className="w-8 h-8 object-cover rounded"
              />
            )}
          </div>
          <div className="font-mono text-sm truncate overflow-hidden">
            {item[displayField] || item._id}
          </div>
        </div>
      ))}
    </div>
  );
}; 