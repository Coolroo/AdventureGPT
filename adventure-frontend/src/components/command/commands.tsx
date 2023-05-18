// List of commands that do not require API calls

import { Adventure, Command, CommandGroup, ConsoleMessage } from "../../types";
import { HistoryStore } from "../history/HistoryStore";
import * as bin from "./commands";
import {app, database} from "../../utils/db";
import { collection, getDoc, getDocs } from "firebase/firestore";
import axios from "axios";
import { ref } from "firebase/database";
import { GameStateStore } from "../gameState/GameStateStore";

export type CommandRef = (historyStore: HistoryStore, gameStateStore?: GameStateStore) => Command;

//UTIL

// Help
export const help: CommandRef = (historyStore: HistoryStore): Command => {
  return {
    name: "help",
    description: "Lists all available commands",
    group: CommandGroup.UTIL,
    execute: () => {
      let groups: string[] = [];
      let commands = Object.values(bin).map((com) => com(historyStore));
      console.log(JSON.stringify(commands));
      Object.values(CommandGroup).forEach((group: CommandGroup) => {
        let block: string = `${group}:`;
        let blockCommands: Command[] = commands.filter(
          (com) => com.group === group
        );
        console.log(`${group}: ${JSON.stringify(blockCommands)}`);
        blockCommands.forEach((command) => {
          block += `\n[${command.name}]: ${command.description}`;
        });
        groups.push(block);
      });
      return Promise.resolve(makePara(groups.join("\n")));
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
      Promise.resolve(makePara( `
        _____ ______ _____ ___      _                 _                  
        |  __ \\| ___ \\_   _/ _ \\    | |               | |                 
        | |  \\/| |_/ / | |/ /_\\ \\ __| |_   _____ _ __ | |_ _   _ _ __ ___ 
        | | __ |  __/  | ||  _  |/ _\` \\ \\ / / _ \\ '_ \\| __| | | | '__/ _ \\
        | |_\\ \\| |     | || | | | (_| |\\ V /  __/ | | | |_| |_| | | |  __/
         \\____/\\_|     \\_/\\_| |_/\\__,_| \\_/ \\___|_| |_|\\__|\\__,_|_|  \\___|
                                                                          
                                                                          
      Type 'help' to see the list of available commands.
      `)),
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

export const list_adventures: CommandRef = (
  historyStore: HistoryStore
): Command => {
  return {
    name: "list_adventures",
    description: "Lists all the adventures available",
    group: CommandGroup.LOBBY,
    execute: async () => {
      let adventureCollection = collection(database, 'adventures');
      let entries = await getDocs(adventureCollection);
      let adventures = entries.docs.map((entry) => entry.data() as Adventure);
      let elements = await Promise.all(adventures.map(async (adventure) => {
        console.log(`Fetching thumbnail from: ${adventure.thumbnail}`);
        const res = await axios({
          headers: {"Access-Control-Allow-Origin": "*"},
          method: 'get',
          responseType: 'blob',
          url: adventure.thumbnail.replace('https://storage.googleapis.com', 'http://localhost:8010/proxy')
        });
        const imageBlob = await res.data;
        const imageObjectURL = URL.createObjectURL(imageBlob);
        return(
          <div>
            <span><img src={imageObjectURL} alt="icons" /></span>
            <span>{`${adventure.title}: ${adventure.intro_text}`}</span>
          </div>
        )
      }))
      return (
        <>
        {elements}
        </>
      );
    },
  };
};

export const get_random_adventure: CommandRef = (historyStore: HistoryStore): Command => {
  return {
    name: "get_random_adventure",
    description: "Chooses a random adventure for you to try out!",
    group: CommandGroup.LOBBY,
    execute: async () => {
      let adventureCollection = collection(database, 'adventures');
      let entries = await getDocs(adventureCollection);
      let adventure = entries.docs[Math.floor(Math.random()*entries.docs.length)].data() as Adventure;
      console.log(`Fetching thumbnail from: ${adventure.thumbnail}`);
      const res = await axios({
        headers: {"Access-Control-Allow-Origin": "*"},
        method: 'get',
        responseType: 'blob',
        url: adventure.thumbnail.replace('https://storage.googleapis.com', 'http://localhost:8010/proxy')
      });
      const imageBlob = await res.data;
      const imageObjectURL = URL.createObjectURL(imageBlob);
      return(
        <div>
          <span><img src={imageObjectURL} alt="icons" /></span>
          <span>{`${adventure.title}: ${adventure.intro_text}`}</span>
        </div>
      )
    }
  }
}

export const play_adventure: CommandRef = (historyStore: HistoryStore, gameStateStore: GameStateStore) => {
  return {
    name: 'play_adventure',
    description: 'Choose an adventure to play! Usage: play_adventure <adventure name>',
    group: CommandGroup.LOBBY,
    execute: async (args: string[]) => {
      let adventureCollection = collection(database, 'adventures');
      let entries = (await getDocs(adventureCollection)).docs.map((doc) => doc.data() as Adventure);
      let adventureName = args.join(' ');
      let adventure = entries.find((adventure) => adventure.title === adventureName);
      if(adventure){
        gameStateStore.setAdventure(adventure);
        return makePara(`Successfully loaded adventure: ${adventureName}`);
      }
      return makePara(`Error loading adventure: ${adventureName}, are you sure you spelled it correctly?`);
    }
  }
}

export const start_game: CommandRef = (historyStore: HistoryStore, gameStateStore: GameStateStore) => {
  return {
    name: 'start_game',
    description: 'Start the adventure you\'ve loaded, you must run (play_adventure) before this',
    group: CommandGroup.LOBBY,
    execute: async () => {
      let adventure = gameStateStore.adventure;
      let started = gameStateStore.started;
      if(adventure && !started){
        gameStateStore.setStarted(true);
        return makePara(adventure.areas.find((area) => area.name === adventure.start_area).description);
      }
      return makePara(`Error starting adventure, ensure you have an adventure loaded with (play_adventure), and you haven't started one already`);
    }
  }
}

const makePara = (inVal: string) => {
  return <p
        className="whitespace-pre-wrap mb-2"
        style={{ lineHeight: 'normal' }}
        dangerouslySetInnerHTML={{ __html: inVal }}
      />
}