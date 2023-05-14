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
  adventure = structuredClone(adventure);
  console.log(`Verifying Adventure ${adventure.title}`);
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
  if (interactions.length == 0) {
    throw new Error("Could not get any initial interactions");
  }
  while (interactions.length > 0) {
    let removeInteractions: number[] = [];
    let didCompleteInteraction = false;
    console.log(
      `Processing Interactions: [\n${interactions
        .map((interaction) => JSON.stringify(interaction, null, 1))
        .join(",\n")}\n]`
    );
    interactions.forEach((interaction, index) => {
      if (
        interaction.required_item == null ||
        items.includes(getItem(adventure, interaction.required_item))
      ) {
        removeInteractions.push(index);
        didCompleteInteraction = true;
        switch (interaction.completion.type) {
          case "end":
            let endingCompletion = interaction.completion as EndCompletion;
            endings.push(getEnding(adventure, endingCompletion.ending_id));
            break;
          case "item":
            let itemCompletion = interaction.completion as ItemCompletion;
            items.push(getItem(adventure, itemCompletion.item_name));
            break;
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
    if (!didCompleteInteraction) {
      throw new Error(
        "Reached a point where player could not complete an interaction"
      );
    }
    console.log(`Removing interactions [${removeInteractions.join(",")}]`);
    removeInteractions.reverse().forEach((index) => {
      interactions.splice(index, 1);
    });
  }
  if (!endings.every((ending) => adventure.endings.includes(ending))) {
    throw new Error("Could not get every ending");
  }
  if (!items.every((item) => adventure.items.includes(item))) {
    throw new Error("Could not get every item");
  }
  if (
    !explored.every((explore) =>
      adventure.areas.includes(getArea(adventure, explore))
    )
  ) {
    throw new Error("Could not explore every area");
  }
};

const exploreArea = (
  adventure: Adventure,
  area: Area,
  alreadyExplored: string[]
): { interactions: Interaction[]; items: Item[]; explored: string[] } => {
  let items = area.items.map((itemName) => getItem(adventure, itemName));

  let interactions = area.interactions.map((thing) => thing);

  alreadyExplored.push(area.name);

  area.paths
    .filter((areaName) => !alreadyExplored.includes(areaName))
    .map((areaName) => getArea(adventure, areaName))
    .forEach((area) => {
      let result = exploreArea(adventure, area, alreadyExplored);
      items = items.concat(result.items);
      interactions = interactions.concat(result.interactions);
      alreadyExplored = alreadyExplored.concat(result.explored);
    });

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
