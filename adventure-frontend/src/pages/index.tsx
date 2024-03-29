import Head from 'next/head';
import React from 'react';
import config from '../../config.json';
import { useHistoryStore } from '../components/history/HistoryStore';
import { banner } from '../components/command/commands';
import { History } from '../components/history/History';
import Input from '../components/input';
import { ConsoleMessage } from '../types';

interface IndexPageProps {
  inputRef: React.MutableRefObject<HTMLInputElement>;
}

const IndexPage: React.FC<IndexPageProps> = ({ inputRef }) => {
  const containerRef = React.useRef(null);
  const addToMessageHistory = useHistoryStore((state) => state.addToMessageHistory);
  const historyState = useHistoryStore();


  const init = React.useCallback(async () => 
    addToMessageHistory({is_user: false, val: await banner(historyState).execute()} as ConsoleMessage)
    , []);

  const history = useHistoryStore((state) => state.commandHistory);

  React.useEffect(() => {
    init();
  }, [init]);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView();
      inputRef.current.focus({ preventScroll: true });
    }
  }, [history]);

  return (
    <>
      <Head>
        <title>{config.title}</title>
      </Head>

      <div className="p-8 overflow-hidden h-full border-2 rounded border-light-yellow dark:border-dark-yellow">
        <div ref={containerRef} className="overflow-y-auto h-full">
          <History />

          <Input
            inputRef={inputRef}
            containerRef={containerRef}
          />
        </div>
      </div>
    </>
  );
};

export default IndexPage;
