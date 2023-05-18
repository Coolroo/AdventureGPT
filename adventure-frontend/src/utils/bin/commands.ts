// List of commands that do not require API calls

import * as bin from "./index";
import config from "../../../config.json";
import { ConsoleMessage } from "../../types.js";

// Help
export const help = async (args: string[]): Promise<string> => {
  const commands = Object.keys(bin).sort().join(", ");
  var c = "";
  for (let i = 1; i <= Object.keys(bin).sort().length; i++) {
    if (i % 7 === 0) {
      c += Object.keys(bin).sort()[i - 1] + "\\\\n";
    } else {
      c += Object.keys(bin).sort()[i - 1] + " ";
    }
  }
  return `Welcome! Here are all the available commands:
\\\\n${c}\\\\n
[tab]: trigger completion.
[ctrl+l]/clear: clear terminal.\\\\n
Type 'sumfetch' to display summary.
`;
};

// Banner
export const banner = (args?: string[]): ConsoleMessage => {
  return {
    is_user: false,
    val: `
  _____ ______ _____ ___      _                 _                  
  |  __ \\| ___ \\_   _/ _ \\    | |               | |                 
  | |  \\/| |_/ / | |/ /_\\ \\ __| |_   _____ _ __ | |_ _   _ _ __ ___ 
  | | __ |  __/  | ||  _  |/ _\` \\ \\ / / _ \\ '_ \\| __| | | | '__/ _ \\
  | |_\\ \\| |     | || | | | (_| |\\ V /  __/ | | | |_| |_| | | |  __/
   \\____/\\_|     \\_/\\_| |_/\\__,_| \\_/ \\___|_| |_|\\__|\\__,_|_|  \\___|
                                                                    
                                                                    
Type 'help' to see the list of available commands.
`,
  };
};
