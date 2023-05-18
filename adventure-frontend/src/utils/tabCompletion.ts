import * as bin from "../components/command/commands";

export const handleTabCompletion = (command: string) => {
  const commands = Object.keys(bin).filter((entry) =>
    entry.startsWith(command)
  );

  if (commands.length === 1) {
    return commands[0];
  }
};
