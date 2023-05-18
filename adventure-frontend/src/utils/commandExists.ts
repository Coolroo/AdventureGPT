import * as bin from "../components/command/commands";

export const commandExists = (command: string) => {
  return Object.values(bin)
    .map((command) => command.name)
    .includes(command);
};
