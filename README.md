# Adventure GPT

## Description

Adventure GPT is a text-based adventure game generator, using GPT-4 to generate stories that players can play! The generator can be run to generate an Adventure, which is essentially the blueprints for an entire game.

### Generator

The generator creates adventures by querying OpenAI, using the prompt specified in `prompts.ts`. This should return JSON data, which is then parsed into an Adventure object as specified in `types.ts`. Adventure's are then verified that they are possible to complete (all items can be gathered, all interactions can be complete, all areas can be accessed, all endings can be achieved), and then stored in a databse (by default the project uses FireStore, but can easily be configured to use whatever DB you want in `crud.ts`).

## Requirements and Installation

Make sure you have npm installed (I use version 9.5, but I'm not sure what exact version is required), and Yarn installed

### Generator

First, you will need to get your [OpenAI Key](https://platform.openai.com/account/api-keys), and put it in a `.env` file in the generator directory.
EG:

```dosini
OPENAI_API_KEY=sk-...
```

Secondly, you will need to setup your database. If you want to use FireStore, follow the steps below; Otherwise, you will have to modify the setup to fit your implementation!

Here is a [quickstart](https://firebase.google.com/docs/firestore/quickstart) for FireStore, follow the steps to create a database, but don't worry about the `Set up your development environment` section.

Create a new collection called `adventures` in your database.

Once the database is setup, download your firebase key, and store it in `*projectRoot*/generator/.firebase/firebase_key.json`

Run the following command to finish setup!

```
yarn
```

You should be all setup now!

## Usage

### Generator

To run the generator, run the following command

```
yarn start
```

You should see `generating adventure...` printed to the console, this typically takes 180s to complete so wait around that long and hopefully you should see `Successfully created adventure (*name of generated adventure*)` printed to the console!
