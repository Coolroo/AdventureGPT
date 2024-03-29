// List of commands that do not require API calls

import {
  Adventure,
  Command,
  CommandGroup,
  ConsoleMessage,
  EndCompletion,
  ItemCompletion,
  PathCompletion,
} from "../../types";
import { HistoryStore } from "../history/HistoryStore";
import * as bin from "./commands";
import { app, database } from "../../utils/db";
import { collection, getDoc, getDocs } from "firebase/firestore";
import axios from "axios";
import { GameStateStore } from "../gameState/GameStateStore";
var randomColor = require("randomcolor");
import config from "../../../config.json";

export type CommandRef = (
  historyStore?: HistoryStore,
  gameStateStore?: GameStateStore
) => Command;

//UTIL

// Help
export const help: CommandRef = (historyStore: HistoryStore): Command => {
  const groupColors: {[key in CommandGroup]?: string} = {
    [CommandGroup.UTIL]: "#FFFF00",
    [CommandGroup.LOBBY]: "#FF0000",
    [CommandGroup.GAMEPLAY]: "#00FF00"
  }
  const usageColor = "#FF00FF";
  return {
    name: "help",
    description: "Lists all available commands",
    group: CommandGroup.UTIL,
    execute: () => {
      let groups: JSX.Element[][] = [];
      let commands = Object.values(bin).map((com) => com(historyStore));
      console.log(JSON.stringify(commands));
      Object.values(CommandGroup).forEach((group: CommandGroup) => {
        let block: JSX.Element[] = [<div><p style={{color: groupColors[group], display: "inline"}}>{group}</p>:</div>];
        let blockCommands: Command[] = commands.filter(
          (com) => com.group === group
        );
        console.log(`${group}: ${JSON.stringify(blockCommands)}`);
        blockCommands.forEach((command) => {
          block.push(<div>[<p style={{color: groupColors[group], display: "inline"}}>{command.name}</p>]: {command.description}. {command.usage && <p style={{color: usageColor, display: "inline"}}>Usage: {command.usage}</p>}</div>);
        });
        groups.push(block);
      });
      return Promise.resolve(<div>{groups}</div>);
    },
  };
};

// Banner
export const banner: CommandRef = (): Command => {
  return {
    name: "banner",
    description: "Displays the GPTAdventure Logo",
    group: CommandGroup.UTIL,
    execute: () =>
      Promise.resolve(
        makePara(`
        _____ ______ _____ ___      _                 _                  
        |  __ \\| ___ \\_   _/ _ \\    | |               | |                 
        | |  \\/| |_/ / | |/ /_\\ \\ __| |_   _____ _ __ | |_ _   _ _ __ ___ 
        | | __ |  __/  | ||  _  |/ _\` \\ \\ / / _ \\ '_ \\| __| | | | '__/ _ \\
        | |_\\ \\| |     | || | | | (_| |\\ V /  __/ | | | |_| |_| | | |  __/
         \\____/\\_|     \\_/\\_| |_/\\__,_| \\_/ \\___|_| |_|\\__|\\__,_|_|  \\___|
                                                                          
                                                                          
      Type 'help' to see the list of available commands.
      `)
      ),
  };
};

// Clear
export const clear: CommandRef = (historyStore: HistoryStore): Command => {
  return {
    name: "clear",
    description: "Clears the terminal",
    group: CommandGroup.UTIL,
    execute: () => {
      historyStore.clearHistory();
      return Promise.resolve(undefined);
    },
  };
};

// LOBBY

export const newest: CommandRef = (
): Command => {
  return {
    name: "newest",
    description: "Finds the newest adventure and gives you details about it!",
    group: CommandGroup.LOBBY,
    execute: async () => {
      let adventureCollection = collection(database, "adventures");
      let entries = (await getDocs(adventureCollection)).docs.map(
        (entry) => entry.data() as Adventure
      );
      let adventure = entries.reduce((prev, current) => {
        return prev.time_stamp > current.time_stamp ? prev : current;
      });
      return getAdventureDisplay(adventure);
    },
  };
};

export const random: CommandRef = (
): Command => {
  return {
    name: "random",
    description: "Chooses a random adventure for you to try out!",
    group: CommandGroup.LOBBY,
    execute: async () => {
      let adventureCollection = collection(database, "adventures");
      let entries = await getDocs(adventureCollection);
      let adventure = entries.docs[
        Math.floor(Math.random() * entries.docs.length)
      ].data() as Adventure;
      return getAdventureDisplay(adventure);
    },
  };
};

export const adventures: CommandRef = (
): Command => {
  return {
    name: "adventures",
    description: "Lists all the adventures available",
    group: CommandGroup.LOBBY,
    execute: async () => {
      let adventureCollection = collection(database, "adventures");
      let entries = await getDocs(adventureCollection);
      let adventures = entries.docs.map((entry) => entry.data() as Adventure);
      let elements = await Promise.all(
        adventures.map(async (adventure) => getAdventureDisplay(adventure))
      );
      return <>{elements}</>;
    },
  };
};

export const load: CommandRef = (
  historyStore: HistoryStore,
  gameStateStore: GameStateStore
) => {
  return {
    name: "load",
    description:
      "Choose an adventure to play!",
    usage: "load (adventure name)",
    group: CommandGroup.LOBBY,
    execute: async (args: string[]) => {
      let adventureCollection = collection(database, "adventures");
      let entries = (await getDocs(adventureCollection)).docs.map(
        (doc) => doc.data() as Adventure
      );
      let adventureName = args.join(" ");
      let adventure = entries.find(
        (adventure) => adventure.title === adventureName
      );
      if (adventure) {

        gameStateStore.setAdventure(fixAdventure(adventure));
        return makePara(`Successfully loaded adventure: ${adventureName}`);
      }
      return makePara(
        `Error loading adventure: ${adventureName}, are you sure you spelled it correctly?`
      );
    },
  };
};

export const start: CommandRef = (
  historyStore: HistoryStore,
  gameStateStore: GameStateStore
) => {
  return {
    name: "start",
    description:
      "Start the adventure you've loaded, you must run (load) before this",
    group: CommandGroup.LOBBY,
    execute: async () => {
      let adventure = gameStateStore.adventure;
      let started = gameStateStore.started;
      if (adventure && !started) {
        gameStateStore.setStarted(true);
        return makePara(
          adventure.intro_text
        );
      }
      return makePara(
        `Error starting adventure, ensure you have an adventure loaded with (load), and you haven't started one already`
      );
    },
  };
};

// Game

export const look: CommandRef = (historyStore: HistoryStore, gameStateStore: GameStateStore) => {
  return {
    name: 'look',
    description: 'Look around the room you are in, and see what there is',
    group: CommandGroup.GAMEPLAY,
    execute: async () => {
      if (!gameStateStore.started) {
        return makePara(
          "You cannot use a Gameplay command if an adventure has not been started! (Refer to Lobby commands)"
        );
      }
      let currentArea = gameStateStore.adventure.areas.find(
        (area) => area.name === gameStateStore.current_location
      );
      let description = currentArea.description;
      let things = [
        ...currentArea.interactions.map((interaction) => interaction.name),
        ...currentArea.items,
      ];
      let paths = currentArea.paths;
      let resultString = `${description}\n\n`;
      if(things.length > 0){
        resultString += `I can see: ${things.join(',')}\n\n`;
      }
      resultString += `I can move to ${paths.join(',')}`
      return makePara(resultString);
    }
  }

}

export const satchel: CommandRef = (historyStore: HistoryStore, gameStateStore: GameStateStore) => {
  return {
    name: 'satchel',
    description: 'Check the contents of your satchel',
    group: CommandGroup.GAMEPLAY,
    execute: async () => {
      if (!gameStateStore.started) {
        return makePara(
          "You cannot use a Gameplay command if an adventure has not been started! (Refer to Lobby commands)"
        );
      }
      return makePara(`I have: ${gameStateStore.items.map((item) => item.name).join(", ")} in my satchel.`);
    }
  }
}

export const examine: CommandRef = (
  historyStore: HistoryStore,
  gameStateStore: GameStateStore
) => {
  return {
    name: "examine",
    description:
      "Examine something in the area you are in.",
    usage: "examine (thing you want to examine)",
    group: CommandGroup.GAMEPLAY,
    execute: async (args: string[]) => {
      if (!gameStateStore.started) {
        return makePara(
          "You cannot use a Gameplay command if an adventure has not been started! (Refer to Lobby commands)"
        );
      }
      if (args[0]) {
        // Get area info
        let currentArea = gameStateStore.adventure.areas.find(
          (area) => area.name === gameStateStore.current_location
        );
        let validChoices = [
          ...currentArea.interactions.map((interaction) => interaction.name),
          ...currentArea.items,
        ];
        if(validChoices.includes(args[0])){
          if (
            currentArea.interactions
              .map((interaction) => interaction.name)
              .includes(args[0])
          ) {
            let interaction = currentArea.interactions.find(
              (interac) => interac.name === args[0]
            );
            return makePara(interaction.description);
          }
          else{
            let item = gameStateStore.adventure.items.find(
              (i) => i.name === args[0]
            );
            return makePara(item.description);
          }
        }
        else{
          return makePara(`I cannot see a ${args[0]}.`);
        }
      } else {
        return makePara("Please specify what you want to examine");
      }
    },
  };
};

export const interact: CommandRef = (
  historyStore: HistoryStore,
  gameStateStore: GameStateStore
) => {
  return {
    name: "interact",
    description:
      "Interact with something in the area you are in.",
    usage: "interact (thing you are interacting with) (item you are using *Optional*)",
    group: CommandGroup.GAMEPLAY,
    execute: async (args: string[]) => {
      if (!gameStateStore.started) {
        return makePara(
          "You cannot use a Gameplay command if an adventure has not been started! (Refer to Lobby commands)"
        );
      }
      //Make sure the player is specifying they want to interact with something
      if (args[0]) {
        // Get area info
        let currentArea = gameStateStore.adventure.areas.find(
          (area) => area.name === gameStateStore.current_location
        );
        let validChoices = [
          ...currentArea.interactions.map((interaction) => interaction.name),
          ...currentArea.items,
        ];
        // Ensure the player input is valid
        if (validChoices.includes(args[0])) {
          //If the player is interacting with an interaction
          if (
            currentArea.interactions
              .map((interaction) => interaction.name)
              .includes(args[0])
          ) {
            //Get the interaction based on the user input
            let interaction = currentArea.interactions.find(
              (interac) => interac.name === args[0]
            );

            if (interaction.required_item == null) {
              // If the player tried to use an item on the interaction
              if (args[1]) {
                return makePara(`I can't seem to get this to work...`);
              }
            } else {
              // If the player tries to interact with this without using an item
              if (!args[1]) {
                return makePara(
                  `I can't seem to do anything with the ${interaction.name}, maybe I need to use something?`
                );
              }
              //If the player does not have the item they're trying to use
              else if (
                !gameStateStore.items
                  .map((state) => state.name)
                  .includes(args[1])
              ) {
                return makePara(`I don't have a ${args[1]}`);
              }
              //If the player is trying to use the wrong item
              else if (args[1] !== interaction.required_item) {
                return makePara(
                  `It doesn't make sense to use the ${args[1]} on the ${interaction.name}`
                );
              }
            }
            // Delete the interaction from the area
            let interactionIndex =
              currentArea.interactions.indexOf(interaction);
            currentArea.interactions.splice(interactionIndex, 1);

            switch (interaction.completion.type) {
              case "path":
                //Add the path to the areas paths
                let pathCompletion: PathCompletion = interaction.completion;
                currentArea.paths.push(pathCompletion.area_id);
                break;
              case "end":
                //End the game
                let endCompletion: EndCompletion = interaction.completion;
                gameStateStore.ending = endCompletion.ending_id;
                gameStateStore.started = false;
                //Log the interaction message
                historyStore.addToMessageHistory({
                  is_user: false,
                  hostname: gameStateStore.started
                    ? gameStateStore.adventure.title
                    : config.ps1_hostname,
                  val: interaction.completion_message,
                });
                return makePara(
                  gameStateStore.adventure.endings.find(
                    (ending) => ending.id === endCompletion.ending_id
                  ).ending_description
                );
              case "item":
                //Add the item to the players inventory
                let itemCompletion: ItemCompletion = interaction.completion;
                let item = gameStateStore.adventure.items.find(
                  (item) => item.name === itemCompletion.item_name
                );
                gameStateStore.items.push(item);
                break;
            }
            return makePara(interaction.completion_message);
          }
          //If the player is interacting with an item
          else {
            let item = gameStateStore.adventure.items.find(
              (i) => i.name === args[0]
            );
            currentArea.items.splice(currentArea.items.indexOf(args[0]), 1);
            gameStateStore.items.push(item);
            return makePara(`I picked up the ${item.name}`);
          }
        } else {
          return makePara(`I cannot see a ${args[0]}.`);
        }
      } else {
        return makePara("Please specify what you want to interact with");
      }
    },
  };
};

export const move: CommandRef = (historyStore: HistoryStore, gameStateStore: GameStateStore) => {
  return {
    name: 'move',
    description: 'Move along a path to an adjacent area.',
    usage: "move (area name)",
    group: CommandGroup.GAMEPLAY,
    execute: async (args: string[]) => {
      if (!gameStateStore.started) {
        return makePara(
          "You cannot use a Gameplay command if an adventure has not been started! (Refer to Lobby commands)"
        );
      }
      if(args[0]){
        let currentArea = gameStateStore.adventure.areas.find(
          (area) => area.name === gameStateStore.current_location
        );
        let paths = currentArea.paths;
        if(paths.includes(args[0])){
          let newArea = gameStateStore.adventure.areas.find((area) => area.name === args[0]);
          gameStateStore.setCurrentLocation(newArea.name);
          return makePara(newArea.description);
        }
        else{
          return makePara(`There is no path to ${args[0]} from here`);
        }
      }
      else{
        return makePara("Please specify the area you want to move to");
      }
    }
  }
}

const fixAdventure = (adventure: Adventure): Adventure => {
  adventure.start_area = adventure.start_area.replaceAll(' ', '_');
  adventure.items.forEach((item) => {
    item.name = item.name.replaceAll(' ', '_');
  });
  adventure.areas.forEach((area) => {
    area.name = area.name.replaceAll(' ', '_');
    area.items.map((itemName) => itemName.replaceAll(' ', '_'));
    area.paths.map((path) => path.replaceAll(' ', '_'));
    area.interactions.forEach((interaction) => {
      let completion = interaction.completion;
      switch(completion.type){
        case "path":
          completion.area_id = completion.area_id.replaceAll(' ', '_');
          break;
        case "item":
          completion.item_name = completion.item_name.replaceAll(' ', '_');
          break;
        default:
          break;
      }
      interaction.name = interaction.name.replaceAll(' ', '_');
      if(interaction.required_item != null){
        interaction.required_item = interaction.required_item.replaceAll(' ', '_');
      }
      
    });
  });
  return adventure;
}

const getAdventureDisplay = async (adventure: Adventure) => {
  console.log(`Fetching thumbnail from: ${adventure.thumbnail}`);
  const res = await axios({
    headers: {  "Access-Control-Request-Headers": ['Content-Type'] },
    method: "get",
    responseType: "blob",
    url: adventure.thumbnail/*.replace(
      "https://storage.googleapis.com",
      "http://localhost:8010/proxy"
    ),*/
  });
  const imageBlob = await res.data;
  const imageObjectURL = URL.createObjectURL(imageBlob);
  return (
    <div>
      <span>
        <img src={imageObjectURL} alt="icons" />
      </span>
      <span>
        <div style={{ color: randomColor() }}>{adventure.title}</div>
        <div>{`${adventure.intro_text}`}</div>
      </span>
    </div>
  );
};

const makePara = (inVal: string) => {
  return (
    <p
      className="whitespace-pre-wrap mb-2"
      style={{ lineHeight: "normal" }}
      dangerouslySetInnerHTML={{ __html: inVal }}
    />
  );
};
