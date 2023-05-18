import React from 'react';
import { Ps1 } from '../Ps1';
import { ConsoleMessage } from '../../types';
import { useHistoryStore } from './HistoryStore';

export const History: React.FC = () => {
  const history = useHistoryStore((state) => state.messageHistory)
  return (
    <>
      {history.map((entry: ConsoleMessage, index: number) => (
        <div key={entry.val.toString() + index}>
          {
            entry.is_user ? (
          <div className="flex flex-row space-x-2">
            <div className="flex-shrink">
              <Ps1 />
            </div>

            <div className="flex-grow">{entry.val}</div>
          </div>
            )
            :
            (
          <p
            className="whitespace-pre-wrap mb-2"
            style={{ lineHeight: 'normal' }}
            dangerouslySetInnerHTML={{ __html: entry.val.toString() }}
          />
            )
          }
        </div>
      ))}
    </>
  );
};

export default History;