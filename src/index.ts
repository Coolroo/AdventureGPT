import { Configuration, OpenAIApi } from "openai";

import * as dotenv from "dotenv";
import { getAdventures, saveAdventure } from "./util/crud.js";
import { createPrompt } from "./util/prompt.js";
import { Adventure } from "./util/types.js";
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const createAdventure = async () => {
  const adventures = await getAdventures();
  console.log("generating adventure...");
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

  let message = chat.data.choices[0].message;

  let responseText = message?.content as string;

  const startIndex = responseText.indexOf("{");
  const endIndex = responseText.lastIndexOf("}") + 1;
  const adventureText = responseText.substring(startIndex, endIndex);

  console.log(adventureText);

  let adventure = JSON.parse(adventureText) as Adventure;

  await saveAdventure(adventure);
  console.log(`Successfully created adventure (${adventure.title})`);
};

createAdventure();
