import * as dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import { createPrompt, createThumbnailPrompt } from "./prompt.js";
import { Adventure } from "./types.js";
import { getAdventures } from "./crud.js";
import { verifyAdventure } from "./verification.js";

dotenv.config();

//Setup openai config
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const createAdventure = async () => {
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
  verifyAdventure(adventure);
  console.log(`Adventure (${adventure.title}) verified, generating thumbnail`);
  let imageBlob = await createAdventureThumbnail(adventure);
  console.log("Finished generating thumbnail");

  return { adventure, imageBlob };
};

const createAdventureThumbnail = async (adventure: Adventure) => {
  let response = await openai.createImage({
    prompt: createThumbnailPrompt(adventure.title),
    n: 1,
    size: "256x256",
  });

  let url = response.data.data[0].url as string;
  let image = await fetch(url);
  return image.blob();
};
