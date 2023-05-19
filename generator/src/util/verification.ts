import {
  Adventure,
  Area,
  EndCompletion,
  Ending,
  Interaction,
  Item,
  ItemCompletion,
  PathCompletion,
} from "./types.js";

export const verifyAdventure = (adventure: Adventure) => {
  console.log(`Verifying Adventure (${adventure.title})`);

  //Get the initial area, and then DFS it for interactions and items
  let initialArea = getArea(adventure, adventure.start_area);
  let initialExplore = exploreArea(adventure, initialArea, []);

  let interactions = initialExplore.interactions;
  let explored = initialExplore.explored;
  let items = initialExplore.items;
  let endings: Ending[] = [];
  console.log(
    `Explored beginning, got these results ${JSON.stringify(
      initialExplore,
      null,
      2
    )}`
  );
  //Ensure there are initial interactions
  if (interactions.length == 0) {
    throw new Error("Could not get any initial interactions");
  }

  let areas = adventure.areas;

  if (
    areas.some((area) => {
      let paths = area.paths;
      let pathAreas = paths.map((areaName) =>
        areas.find((otherArea) => otherArea.name === areaName)
      );
      return pathAreas.some(
        (otherArea) =>
          !(
            otherArea?.paths.includes(area.name) ||
            otherArea?.interactions.some(
              (interaction) =>
                interaction.completion.type === "path" &&
                interaction.completion.area_id === area.name
            )
          )
      );
    })
  ) {
    throw new Error("Some areas have invalid path structures!");
  }

  //Process all the interactions
  while (interactions.length > 0) {
    let removeInteractions: number[] = [];
    let didCompleteInteraction = false;
    console.log(
      `Processing Interactions: [\n${interactions
        .map((interaction) => JSON.stringify(interaction, null, 1))
        .join(",\n")}\n]`
    );
    console.log(
      `Player currently has items: [${items
        .map((item) => item.name)
        .join(",")}]`
    );

    //For each of the interactions, try and complete them
    interactions.forEach((interaction, index) => {
      //If the item is null, player can interact with it by default, otherwise ensure the player has access to the required item
      if (
        interaction.required_item == null ||
        items.includes(getItem(adventure, interaction.required_item))
      ) {
        //mark this interaction for removal, and confirm we have completed an interaction in this iteration of the loop
        removeInteractions.push(index);
        didCompleteInteraction = true;

        //Resolve the effect of the interaction
        switch (interaction.completion.type) {
          //If the interaction is an ending, add it to the endings list
          case "end":
            let endingCompletion = interaction.completion as EndCompletion;
            endings.push(getEnding(adventure, endingCompletion.ending_id));
            break;
          //If the interaction gives the player an item, give it to the player
          case "item":
            let itemCompletion = interaction.completion as ItemCompletion;
            items.push(getItem(adventure, itemCompletion.item_name));
            break;
          //If the interaction opens a path, DFS the new area and add the results to the current scope
          case "path":
            let pathCompletion = interaction.completion as PathCompletion;
            let area = getArea(adventure, pathCompletion.area_id);
            let newExplore = exploreArea(adventure, area, explored);
            explored = explored.concat(newExplore.explored);
            interactions = interactions.concat(newExplore.interactions);
            items = items.concat(newExplore.items);
            break;
        }
      }
    });
    //If the player can't complete any interactions, this is a problem
    if (!didCompleteInteraction) {
      throw new Error(
        "Reached a point where player could not complete an interaction"
      );
    }
    console.log(`Removing interactions [${removeInteractions.join(",")}]`);
    //Reverse to account for splice shifting
    removeInteractions.reverse().forEach((index) => {
      interactions.splice(index, 1);
    });
  }
  //Ensure every ending can be achieved
  if (!adventure.endings.every((ending) => endings.includes(ending))) {
    throw new Error("Could not get every ending");
  }
  //Ensure player can get every item
  if (!adventure.items.every((item) => items.includes(item))) {
    throw new Error("Could not get every item");
  }
  //Ensure player can explore every area
  let exploredAreas = explored.map((explored) => getArea(adventure, explored));
  if (!adventure.areas.every((area) => exploredAreas.includes(area))) {
    throw new Error("Could not explore every area");
  }
};

const exploreArea = (
  adventure: Adventure,
  area: Area,
  alreadyExplored: string[]
): { interactions: Interaction[]; items: Item[]; explored: string[] } => {
  // Get the items/interactions in this area, then add this area to the already explored list
  let items = area.items.map((itemName) => getItem(adventure, itemName));

  let interactions = area.interactions.map((thing) => thing);

  alreadyExplored.push(area.name);

  //Recursively search the areas along paths for interactions, and items
  area.paths
    .filter((areaName) => !alreadyExplored.includes(areaName))
    .map((areaName) => getArea(adventure, areaName))
    .forEach((area) => {
      let result = exploreArea(adventure, area, alreadyExplored);
      items = items.concat(result.items);
      interactions = interactions.concat(result.interactions);
      alreadyExplored = alreadyExplored.concat(result.explored);
    });

  //Ensure that each result has unique list elements
  interactions = [...new Set(interactions)];
  items = [...new Set(items)];
  alreadyExplored = [...new Set(alreadyExplored)];

  return {
    interactions,
    items,
    explored: alreadyExplored,
  };
};

const getItem = (adventure: Adventure, itemName: string) => {
  return adventure.items.find((item) => item.name == itemName) as Item;
};

const getArea = (adventure: Adventure, areaName: string) => {
  return adventure.areas.find((area) => areaName == area.name) as Area;
};

const getEnding = (adventure: Adventure, endingId: number) => {
  return adventure.endings.find((ending) => ending.id == endingId) as Ending;
};
