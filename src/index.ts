import { Configuration, OpenAIApi } from "openai";

import * as dotenv from "dotenv";
import { getAdventures, saveAdventure } from "./util/crud.js";
import { createPrompt } from "./util/prompt.js";
import { Adventure } from "./util/types.js";
import { verifyAdventure } from "./util/verification.js";
dotenv.config();

//Setup openai config
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const createAdventure = async () => {
  //Get previously generated adventures from db
  const adventures = await getAdventures();
  console.log("generating adventure...");

  //Get OpenAI GPT-4 completion using the prompt to generate a game
  const chat = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: createPrompt(
          adventures.map((adventure: Adventure) => adventure.title)
        ),
      },
    ],
    max_tokens: 2048,
    temperature: 0.6,
  });

  //Get the response text, and then get the JSON object contained within it

  let responseText = chat.data.choices[0].message?.content as string;

  const startIndex = responseText.indexOf("{");
  const endIndex = responseText.lastIndexOf("}") + 1;
  const adventureText = responseText.substring(startIndex, endIndex);

  //Parse the adventure response, and make it an Adventure object

  let adventure = JSON.parse(adventureText) as Adventure;

  try {
    //Verify the adventure, if something goes wrong this will throw an error
    verifyAdventure(adventure);

    //If all is good, save the adventure in the DB
    await saveAdventure(adventure);
    console.log(`Successfully created adventure (${adventure.title})`);
  } catch (e) {
    console.log(`Could not verify adventure for reason: ${e}`);
  }
};

createAdventure();
