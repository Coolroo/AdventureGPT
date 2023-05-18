export type ConsoleMessage = {
  is_user: boolean;
  val: string | JSX.Element;
};

export enum CommandGroup {
  UTIL = "Utility Functions",
  LOBBY = "Lobby Functions",
  GAMEPLAY = "Gameplay Functions",
}

export interface Command {
  name: string;
  description: string;
  group: CommandGroup;
  execute: (args?: string[]) => Promise<string | JSX.Element>;
}
