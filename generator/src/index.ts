import { saveAdventure } from "./util/crud.js";
import { createAdventure } from "./util/content_generation.js";

//Get previously generated adventures from db

try {
  let adventure = await createAdventure();

  //If all is good, save the adventure in the DB
  await saveAdventure(adventure.adventure, adventure.imageBlob);
  console.log(`Successfully created adventure (${adventure.adventure.title})`);
} catch (e) {
  console.log(`Could not verify adventure for reason: ${e}`);
}
