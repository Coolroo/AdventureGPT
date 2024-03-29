import React from 'react';
import { Ps1 } from '../Ps1';
import { ConsoleMessage } from '../../types';
import { useHistoryStore } from './HistoryStore';
import { useGameState } from '../gameState/GameStateStore';

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
              <Ps1 hostname={entry.hostname}/>
            </div>

            <div className="flex-grow">{entry.val}</div>
          </div>
            )
            :
              entry.val
          }
        </div>
      ))}
    </>
  );
};

export default History;