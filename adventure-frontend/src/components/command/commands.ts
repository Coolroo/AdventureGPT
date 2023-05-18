// List of commands that do not require API calls

import { Command, CommandGroup, ConsoleMessage } from "../../types.js";
import { HistoryStore } from "../history/HistoryStore";
import * as bin from "./commands";

// Help
export const help = (historyStore: HistoryStore): Command => {
  return {
    name: "help",
    description: "Lists all available commands",
    group: CommandGroup.UTIL,
    execute: () => {
      let groups: string[] = [];
      let commands = Object.values(bin).map((com) => com(historyStore));
      Object.keys(CommandGroup).forEach((group: CommandGroup) => {
        let block: string = `${group}:`;
        let blockCommands: Command[] = commands.filter(
          (com) => com.group === group
        );
        blockCommands.forEach((command) => {
          block += `\n[${command.name}]: ${command.description}`;
        });
        groups.push(block);
      });
      return Promise.resolve(groups.join("\n"));
    },
  };
};

// Banner
export const banner = (historyStore: HistoryStore): Command => {
  return {
    name: "banner",
    description: "Displays the GPTAdventure Logo",
    group: CommandGroup.UTIL,
    execute: () =>
      Promise.resolve(`
      _____ ______ _____ ___      _                 _                  
      |  __ \\| ___ \\_   _/ _ \\    | |               | |                 
      | |  \\/| |_/ / | |/ /_\\ \\ __| |_   _____ _ __ | |_ _   _ _ __ ___ 
      | | __ |  __/  | ||  _  |/ _\` \\ \\ / / _ \\ '_ \\| __| | | | '__/ _ \\
      | |_\\ \\| |     | || | | | (_| |\\ V /  __/ | | | |_| |_| | | |  __/
       \\____/\\_|     \\_/\\_| |_/\\__,_| \\_/ \\___|_| |_|\\__|\\__,_|_|  \\___|
                                                                        
                                                                        
    Type 'help' to see the list of available commands.
    `),
  };
};
