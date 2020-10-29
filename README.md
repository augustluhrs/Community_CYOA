# Community_CYOA

Discord bot for a community-generated Choose-Your-Own-Adventure story where whenever a reader gets to a dead-end node, they have to write that section of the story.

Based on an idea from Marie Claire LeBlanc Flanagan @omarieclaire

Made with help from Dan Shiffman's Discord Bot tutorials ([this one](https://github.com/CodingTrain/Discord-Bot-Choo-Choo) in particular) 

and Shawn Van Every's recommendation to use nedb for the database stuff!


### HOW TO ADD
- !init channel
- to edit, user needs administrator or manage_channels permissions


### PROJECT TO DO:

First Steps
- ~~hello world~~
- ~~basic story response structure~~
- ~~private message~~
- ~~save story to file and read from file~~
- ~~tutorial on !help~~

Second Steps
- ~~redo instructions for clarity~~
- ~~fix weird indentations on !help~~
- ~~use currentStories to prevent duplicate nodes if concurrent players land on same spot~~
- ~~oh wait, need to update myStory incase people are splicing the array mid-story, or prevent somehow -- using timer to clear array~~
- ~~setting up channel specific stories, scalable~~
- ~~giving admins edit access~~
- edit process
- ~~new story ability~~
- how to guide for adding to channels
- ~~test branch instead of commiting to main~~
- ~~perma-run on glitch~~
- feedback command
- show which paths have been answered already!
- ~~prevent duplicate story names~~
- ~~test exporting the stories~~
- ~~figure out how to import to glitch without erasing files -- guess i could just export before importing~~
- ~~init on specific channel so no server bleed~~
- remove channel
- ~~what's up with having two projects running at same time? issue with not turning off bot before reuploading new code? regen token for now...~~
- ~~add stop function to shutdown bot? SIGTERM && I'm the only one who can~~
- add code comments for others understanding

Stretch
- save that story to file or email it or something
- story visualization tree map
- real time multiplayer with voting on next node and collab story at end
- nodes that can link to existing nodes/return to checkpoints
- personal stats

