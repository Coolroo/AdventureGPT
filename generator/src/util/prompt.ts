export const createPrompt = (previousTitles: string[]): string => {
  return `You are a game developer, and you are tasked with creating a themed puzzle game. You will need to create an initial plot hook, develop the theme through gameplay, and then an ending when the player finishes the game.

The game is formatted as a series of "areas" (places the player can be in), "items" (things the player can collect in their inventory to use for future interactions), and "interactions (things in areas that players can examine/use items on). The game is played through a series of interactions, which will have a message attached to them, so that when a player examines them it gives them some context to what the interaction is EG: a window interaction, when examining the following message is provided: "There is a key hanging outside the window, but the window is locked.". When generating interactions, do not use the window example verbatim, just use it as a template for other interactions.

Players are also able to examine areas, which should give a description of what they see in the area, eg: a dining room area, which when examined the following message is provided "There is a stench in the air, rotting food lays on plates spread out across the table, knives stabbed into the walls indicate that something terrible happened here.

Areas should be created using the JSON format below:
\`\`\`json
{
	name: <Name of the area>,
	description: <Description of the room>,
	paths: <List of area name’s that this room has paths to>,
	interactions: <List of interaction objects that are in this area>,
	items: <List of item name’s that are in this room>
}
\`\`\`

The description of the room should take into consideration the items in the room, the paths that the room has, and the interactions and mention them in a way that fits into the theme of the room. Maintain consistency between paths, if a player is entering an area through a door, and the description of the other area says they came through a trap door, that doesn’t make sense. So ensure that path descriptions are consistent. Also, don’t forget to mention the items, and the interactions.

If an interaction would unlock a path, the area that the interaction is in should not already have a path to the area that would be unlocked with the interaction.

Note that some areas may not have any paths to them at the beginning of the game, that is okay, as long as there is an interaction in the game that allows the player to eventually reach that area

Think of Areas as nodes on a graph, which are connected with edges "paths". These paths are how the player will move through the game from area to area. Paths can be locked, and and unlocked throughout the course of the game preventing/allowing players to travel across them respectively. Paths are represented in the area object, as area ID's that the room is connected to

Make sure that the player is never stranded, they should always be able to interact with at least 1 interaction using items that they have/items that are in the area they are in.

Each Area must have the following:
1. A description of the area, for when the player examines it
2. at least 1 item used for future interactions, or 1 interaction.
4. At least 1 path, or 1 interaction which opens a path, which uses items that the player could have access to.

All interactions will require the player to use an item on them to progress the story, once this happens, the interaction should do one of the following completion events:
1. unlock a path, so players can now move to another area, an example of this would be the following JSON Object:
\`\`\`json
{
	type: “path”,
	area_id: <Name of the area that this area now has a path to>
}
\`\`\`
2. give the player an item, an example of this would be the following JSON Object:
\`\`\`json
{
	type: “item”,
	item_name: <name of the item the player will get, item's are stored in the game object>
}
\`\`\`
3.  end the game, an example of this would be the following JSON Object:
\`\`\`json
{
	type: “end”,
	ending_id: <the ID of the ending to activate>
}
\`\`\`


Interactions should be created using the JSON format below:
\`\`\`json
{
	name: <A name of what the interaction should be labeled as, this name should be from the perspective of what the player would see>,
	description: <A description of the interaction when a player examines it>,
	completion: <the event to occur when the interaction is completed>,
	required_item: <name of the required item to complete the interaction, if the player doesn’t need an item, this should be null>,
	completion_message: <A message shown to the player that describes their interaction, and what it has changed>
}
\`\`\`

If you create an end interaction, make sure that the completion_message relates to the ending that it activates, and forms a coherent series of events, with the completion message happening before the ending message.

Interactions should be seen as a graph, there are nodes which are the interactions themselves, and the edges that connect nodes are when a player uses an item on them. An example of this is a player using a key on a door (interaction), which unlocks the door, opening the path to another room. And therefore allowing the player to interact with the interactions that were in the room they could not previously enter.

You must make sure that players will always be able to interact with the next interaction in the graph, for this to be true they must: have access to the area the interaction is in, and must have the item that the interaction needs to complete (ignore item requirement if required_item is null). Do not ever break this rule. I trust you, and believe you can do this.

Make sure interactions make sense for where they are, it would not make sense for there to be a window in a cave, so make sure the context of the interaction is valid. Also make sure the required item makes sense, it doesn’t make sense that using a fork on a door should unlock it, unless there is an indent of a fork, or something obvious that would imply that, so make sure your interactions make sense. Also, make sure the items that the player has to use on them makes sense, taking the completion_message into account for what item it used to complete the interaction (if the required_item is null, the player is using some part of their body to interact with it).

Interactions that end the game should be at the end of the graph, and multiple interactions may lead to the ending. However, players should have to interact with at least 5 other interactions before they reach an end game interaction.

Once an interaction has been completed (a player uses the correct item on them, or uses nothing if required_item is null), there should be a message describing what the interaction did, however you do not need to be explicit with the changes. An example would be the player pulling a lever on the wall, which opens a door in another room (area) may have the completed message of "You hear a door creak open in another room".

All items should have the following two attributes:
(name). a name
(description). A description of the item

Items should be created using the JSON format below:

\`\`\`json
{
	name: <name of the item>,
	description: <description of the item>
}
\`\`\`

An example of an item would be: 
\`\`\`json
{name: "hammer", description: "A ball-point hammer"}
\`\`\`

When generating items, do not use the hammer item described above verbatim, use it as a template to create other items.

Items should be unique, there should only be 1 of a type of item in a game, eg: only 1 item named hammer in a game.

Try to limit items being in the same room as the interaction that uses them is, but make sure that the player can always complete at least one interaction with the items that they can have/access. If the player can’t travel to the room that has the item for the interaction that they need to proceed, the game is broken, so make sure that doesn’t happen!

There can be multiple endings to a game, and each ending should have a description of what happened.

Endings should be created using the JSON format below:
\`\`\`json
{
	id: <the ID of the ending>,
	ending_description: <The description of the ending, which will describe the ending the player got
}
\`\`\`

There should be an interaction for all of the generated endings, please ensure the player will be able to achieve all the endings.

Please choose a unique theme as well, the following themes have already been used, so don’t use them again: ${previousTitles.join(
    ","
  )}.

Please remember the rule above, which states that “You must make sure that players will always be able to interact with the next interaction in the graph, for this to be true they must: have access to the area the interaction is in, and must have the item that the interaction needs to complete (ignore item requirement if required_item is null). Do not ever break this rule. I trust you, and believe you can do this.”

You have 2048 tokens to complete your entire response, so keep that in mind so you don’t go over.

You can do it! I believe in you!

Please generate a JSON object which describes the game using the format below:
\`\`\`json
{
	title: <the title of the game>,
	endings: <List of all the ending objects in the game>,
	items: <List of all the item objects in the game>,
	areas: <List of all the area objects in the game>,
	start_area: <The name of the area that the player starts in>,
	intro_text: <Text that is shown to the user at the beginning of the game to set the scene>
\`\`\`
`;
};
