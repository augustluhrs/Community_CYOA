# Community_CYOA

Discord bot for a community-generated Choose-Your-Own-Adventure story where whenever a reader gets to a dead-end node, it's their turn to write the next section of the story and the choices branching out from it.

by August Luhrs, Oct. 2020

Based on an idea from Marie Claire LeBlanc Flanagan @omarieclaire

Made with help from Dan Shiffman's Discord Bot tutorials ([this one](https://github.com/CodingTrain/Discord-Bot-Choo-Choo) in particular) 

and Shawn Van Every's recommendation to use nedb for the database stuff!

Discord App Icon the album art for The Fountain LP by [Nicole Gustafsson](http://www.nimasprout.com/vinyl)


## HOW TO ADD TO YOUR SERVER

1. Make sure you have MANAGE_SERVER permission for the server you want to add this to.

2. [Click here to add the bot to one of your servers](https://discord.com/oauth2/authorize?client_id=768553907546226760&scope=bot)

3. Once the bot has been added, any user with ADMINISTRATION or MANAGE_CHANNELS permissions can type `!init channel` in a channel they want the bot to listen to. (Note: it's literally the word "channel", not the specific name of the channel)

4. HOW TO USE:
* To start a new story, type `!new` followed by the story title. i.e. `!new Our Story`
* To play, type `!start` followed by the story title, i.e. `!start Our Story`
* For help and a list of commands, type `!help`


### PROJECT LICENSE

Still figuring this out.
Feel free to use this wherever or copy it to make your own.
Actually, use this wherever as long as it's not some fucking alt-right cesspool server.
Attribution is appreciated!


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
- ~~edit process~~
- ~~new story ability~~
- ~~how to guide for adding to channels~~
- ~~test branch instead of commiting to main~~
- ~~perma-run on glitch~~
- ~~feedback command~~
- ~~show which paths have been answered already! go back and make options **bold**~~
- ~~prevent duplicate story names~~
- ~~test exporting the stories~~
- ~~figure out how to import to glitch without erasing files -- guess i could just export before importing~~
- ~~init on specific channel so no server bleed~~
- ~~remove channel~~
- ~~what's up with having two projects running at same time? issue with not turning off bot before reuploading new code? regen token for now...~~
- ~~add stop function to shutdown bot? SIGTERM && I'm the only one who can~~
- ~~add code comments for others understanding + overview in comments~~
- ~~add backticks for commands in strings~~
- prevent glitch db from getting overwritten
- ~~add finished tag to passage to fix if someone doesn't finish halfway through~~
- ~~add bot photo (tree?)~~
- ~~update err logs to if(err) and add db log with timestamp~~
- have sample.db and local development guide for forking
- replace the if-hydra with a "command handler" and module.exports ala [Coding Garden Discord Bot](https://github.com/CodingGarden/intro-discord-bot/tree/master/src)
- figure out the indentation issue in !help
- ~~error log retrieval command~~ 
- ~~fix the overlap bug~~
- remove specific story without messing up path of the future stories
- bold paths of edited branches with pre-existing linked stories

Privacy Considerations
- get rid of usernames in db
- hide db
- private glitch project if hiding db

Stretch
- better name?
- save that story to file or email it or something
- story visualization tree map
- real time multiplayer with voting on next node and collab story at end
- nodes that can link to existing nodes/return to checkpoints
- personal stats
- upgrade to actual database server
- use indexing if db gets slow
- could create db from json file instead of db

