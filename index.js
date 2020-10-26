//database stuff
const Datastore = require('nedb');
// var db = new Datastore({filename: "dataTest.db", autoload: true});
// var db = new Datastore({filename: "secret_stories/testStory.db", autoload: true});
// var db = new Datastore({filename: "secret_stories/eberronStory.db", autoload: true});

//now just making one database with all the different stories in it
var db = new Datastore({filename: "secret_stories/discordStories.db", autoload: true});

// Discord stuff
const Discord = require('discord.js');
const client = new Discord.Client();

require('dotenv').config();

// const serverID = process.env.SERVERID;
// const channelID = process.env.CHANNELID;

//story user stuff
let currentStories = [];

client.once('ready', () => {
  console.log('Ready!');
});

client.login(process.env.TOKEN);
client.on('message', gotMessage);

function gotMessage(msg) {

//now removing channel requirements, but adding channel tag to docs
    if (msg.content === 'ping') {
        msg.channel.send('pong');
    }
    if(msg.content === '!help'){
        //TODO update tutorial
        msg.channel.send('to start the story type "!start" and I\'ll send you a private message with the beginning of your story.');
        //list of commands: new edit start
        //help sections: story,     
    }
    if(msg.content.startsWith('!new ') && msg.channel.type != 'dm'){  //start a new story in that channel

        //special role permission? no, anyone can make a new story
        let newStoryName = msg.content.substr(5);
        console.log("new Story Name: " + newStoryName);
        let numStories;
        db.find({type:"story", channel: msg.channel.id}, function(err, docs){
            console.log("new story err: " + err);
            numStories = docs.length.toString();

            db.insert({type: "story", channel: msg.channel.id, path: numStories, name: newStoryName, branches: "1", passage: "Welcome to " + newStoryName + "! Please type \"!0\" to begin."});

            msg.channel.send('Successfully created new story: ' + newStoryName);
        });
    }
    if(msg.content === '!edit'){
        //if has admin powers, send to private message
        if(msg.channel.permissionsFor(msg.author.id).has('ADMINISTRATOR') || msg.channel.permissionsFor(msg.author.id).has('MANAGE_CHANNELS')){
            msg.channel.send('Starting edit process in your private messages.');
            //EDIT TODO
            client.users.cache.get(msg.author.id).send('sorry i don\'t know how to edit yet ._.\'');
        } else {
            // console.log(msg.channel.permissionsFor(msg.author.id));
            msg.channel.send('Sorry you don\'t have permission to do that, you need to have ADMINISTRATOR or MANAGE_CHANNELS permissions.');
        }
    }
  
    if(msg.content.startsWith('!start')){
        //if no story yet, prompt with !new
        db.find({channel: msg.channel.id}, function(err, docs){
            console.log("!start err: " + err);
            if(docs[0] == null){
                msg.channel.send('There\'s no story in this channel yet! Please type "!new" to create one.');
                return;
            } else { //good to go

                let storyName = msg.content.substr(7);
                console.log("story Name: " + storyName);
                db.find({channel: msg.channel.id, type: "story", name: storyName }, function(err, docs){
                
                    if(docs.length == 1){//only one story
                        msg.channel.send('starting! check your private messages please ~ * ~ *');  
                        // client.users.cache.get(msg.author.id).send('welcome. here is your story:');

                        //check all current stories and see if this user played before but didn't finish, delete that
                        for(let i  = currentStories.length - 1; i >= 0; i--){
                            if(currentStories[i].player == msg.author.username){
                                currentStories.splice(i, 1);
                            }
                        }
                        console.log("docs path: " + docs[0].name);
                        let newPlaythrough = {
                            player: msg.author.username,
                            channel: msg.channel.id,
                            path: docs[0].path,
                            isWritingNewNode: false,
                            hasFinishedPassage: false
                        }
                        currentStories.push(newPlaythrough);

                        // db.find({path: docs[0].path}, function(err, docs) {
                        //     console.log('starting story err: ' + err);
                        client.users.cache.get(msg.author.id).send(docs[0].passage);
                        // });


                    } else { //no story by that name
                        msg.channel.send('Which story would you like to play? Type "!start " followed by one of the following story names: \n');
                        db.find({channel: msg.channel.id, type: "story"}, function(err, docs){
                            console.log('listing story names err: ' + err);
                            docs.forEach(doc => msg.channel.send(doc.name + "\n")); 
                        });
                         
                    }
                
                });
            }
        });
    }

    if (msg.channel.type == "dm") { //DM channel
        //first make sure it's not the bot
        if(msg.author.username == "CommunityCYOA") return;

        //find this users story
        let myStory;
        for(let i = 0; i < currentStories.length; i++){
            if(currentStories[i].player == msg.author.username) myStory = i; //first time using no {} in if statement...
        }
        console.log("my story: " + myStory);
        if(myStory == null) {
            //if they try to start from the dm
            client.users.cache.get(msg.author.id).send('something\'s wrong, please start from the server channel, not here.');
            return;
        }

        if(!currentStories[myStory].isWritingNewNode){ //if still going through story
            //adjust number of checks based on how many branches that story node has
            let branches;
            // let wtf = 0;
            console.log("current path: " + currentStories[myStory].path);
            //the function in db.find not working how i expect... it's going too slowly
            db.find({channel: currentStories[myStory].channel, path: currentStories[myStory].path}, function(err, docs){ 
                console.log('branch err:' + err);
                console.log("docs:" + docs);
                branches = parseInt(docs[0].branches);

                //check for next story command
                let hasStoryProgressed = false;
                for(let b = 0; b < branches; b++){
                    // console.log("option: " + b);
                    if(msg.content == "!" + b){
                        console.log('branch chosen: ' + b);
                        currentStories[myStory].path = currentStories[myStory].path.concat(b); //because concat just returns other string, doesn't modify source?
                        hasStoryProgressed = true;
                    }
                }
                if(!hasStoryProgressed){ //if they don't type correctly
                    client.users.cache.get(msg.author.id).send('sorry, thats not an option I understand, please pick again');
                } else { //progress story
                    db.find({path: currentStories[myStory].path}, function(err, docs){
                        console.log("next section err: " + err);
                        if(docs[0] == null){
                            //new node in the story, trigger prompt
                            client.users.cache.get(msg.author.id).send("You've reached a blank story node! You get to write this next section. \nPlease type out the next passage of this story, and then I will ask you what you want the options branching out from that passage to be. Just make sure if you want to add a new paragraph, you SHIFT-ENTER, as pressing ENTER will submit the passage.");
                            currentStories[myStory].isWritingNewNode = true;
                        } else{
                            client.users.cache.get(msg.author.id).send(docs[0].passage);
                        }
                    });
                }
            });
        } else { //is writing a new story node
            if(!currentStories[myStory].hasFinishedPassage){ //has written passage, update the doc
                console.log('new story from ' + currentStories[myStory].player + " at " + currentStories[myStory].path + ": " + msg.content);
                //why am i updating this one? not insert?
                db.update({path: currentStories[myStory].path}, {channel: currentStories[myStory].channel, path: currentStories[myStory].path, passage: msg.content, branches: 0}, {upsert: true}, function(err, newDoc){ //not sure if it matters to update/upsert rather than just insert since if all works, there won't be a doc matching the query...
                    console.log("err: " + err);
                });
                currentStories[myStory].hasFinishedPassage = true;
                client.users.cache.get(msg.author.id).send('Now I\'ll ask you for the choices branching out from this new passage. \n What\'s option one? Type it in the chat (you don\'t have to worry about the !0 !1 .. etc., just the choice.)');
            } else { //finished passage, now update the branches
                if(msg.content == "END" || msg.content == "end" || msg.content == "End" || msg.content == "end " || msg.content == "END "){ //gotta be a better way to do this.
                    client.users.cache.get(msg.author.id).send('Thanks for playing! Go back to the server channel whenever you want to play again.');
                    currentStories.splice(myStory,1);
                    // currentStories[myStory].isWritingNewNode = false;
                    // currentStories[myStory].hasFinishedPassage = false; //not needed but just in case?
                } else {
                    //another too slow, really need to learn async/await &| promises again
                    // let thisPassage;
                    //gotta be a better way to do this, don't know how to access variables from within update
                    db.find({path: currentStories[myStory].path}, function(err, doc){
                        console.log("passageFind err: " + err);
                        // thisPassage = doc[0].passage;
                        db.update({path: currentStories[myStory].path}, { //no upsert
                            $set: {
                                passage: doc[0].passage.concat("\n\n !" + doc[0].branches + ": " + msg.content)
                                // passage : thisPassage.concat("\n\n Type !" + branches + ": " + msg.content)
                            },
                            $inc: {
                                branches: 1
                            }
                        }, function(err, newDocs){
                            console.log("option err: " + err);
                        });
                    });
                    
                    client.users.cache.get(msg.author.id).send('Great. Type in the next option or type END to finish.');
                }
            }
        }
    }
}