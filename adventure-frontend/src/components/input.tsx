import React from 'react';
import { commandExists } from '../utils/commandExists';
import * as bin from "./command/commands";
import { handleTabCompletion } from '../utils/tabCompletion';
import { Ps1 } from './Ps1';
import { useHistoryStore } from './history/HistoryStore';

export const Input = ({
  inputRef,
  containerRef,
}) => {
  const command = useHistoryStore((state) => state.command);
  const setCommand = useHistoryStore((state) => state.setCommand);
  const commands = useHistoryStore((state) => state.commandHistory);
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const decrementPos = useHistoryStore((state) => state.decrementPos);
  const incrementPos = useHistoryStore((state) => state.incrementPos);
  const addToCommandHistory = useHistoryStore(
    (state) => state.addToCommandHistory
  );
  const addToMessageHistory = useHistoryStore(
    (state) => state.addToMessageHistory
  );
    const historyStore = useHistoryStore((state) => state);

  const shell = async (command: string) => {

    const args = command.split(" ");
    args[0] = args[0].toLowerCase();
  
    addToMessageHistory({
      is_user: true,
      val: command,
    });
    addToCommandHistory(command);
    if (args[0] === "clear") {
      clearHistory();
    } else if (command === "") {
    } else if (Object.keys(bin).indexOf(args[0]) === -1) {
      addToMessageHistory({
        is_user: false,
        val: `shell: command not found: ${args[0]}. Try 'help' to get started.`,
      });
    } else {
      const command = Object.values(bin).map((com) => com(historyStore)).find((com) => com.name === args[0]);
      if(command){
        let result = await command.execute(args.slice(1));
        if(result){
          addToMessageHistory({ is_user: false, val: result });
        }
        
      }
      
    }
    setCommand('');
  };
  

  const onSubmit = async (event: React.KeyboardEvent<HTMLInputElement>) => {


    if (event.key === 'c' && event.ctrlKey) {
      event.preventDefault();
      clearHistory()
    }

    if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      clearHistory()
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      setCommand(handleTabCompletion(command));
    }

    if (event.key === 'Enter' || event.code === '13') {
      event.preventDefault();
      await shell(command);
      containerRef.current.scrollTo(0, containerRef.current.scrollHeight);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!commands.length) {
        return;
      }
      decrementPos();
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!commands.length) {
        return;
      }
      incrementPos()
    }
  };

  const onChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    
    setCommand(value);
  };

  return (
    <div className="flex flex-row space-x-2">
      <label htmlFor="prompt" className="flex-shrink">
        <Ps1 />
      </label>

      <input
        ref={inputRef}
        id="prompt"
        type="text"
        className={`bg-light-background dark:bg-dark-background focus:outline-none flex-grow ${
          commandExists(command) || command === ''
            ? 'text-dark-green'
            : 'text-dark-red'
        }`}
        value={command}
        onChange={onChange}
        autoFocus
        onKeyDown={onSubmit}
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  );
};

export default Input;
