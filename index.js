//database stuff
const Datastore = require('nedb');
// var db = new Datastore({filename: "dataTest.db", autoload: true});
// var db = new Datastore({filename: "secret_stories/testStory.db", autoload: true});
// var db = new Datastore({filename: "secret_stories/eberronStory.db", autoload: true});

//now just making one database with all the different stories in it
var db = new Datastore({filename: "secret_stories/discordStories.db", autoload: true});




// db.update({type: "globalData"}, {$set: {"timeLastUsed": Date.now()}}, {upsert: true}, function(err, upsert){
//     console.log("err: " + err);
//     console.log("upsert: " + upsert);
// });
//not sure why above is creating two diff docs with same id...

//i don't know how to just start the db with a story doc, when i tried adding it manually it got corrupted
// db.update({type: "passage", path: "0", branches: "3", passage: "We begin on a train barrelling down House Orien's Lighning Rail Line. We are about to begin a journey of discovery... a journey of mystery... a journey of stupid shit, endless stupid shit. But first, which car should we go to? \n Type !0 to start in the PASSENGER CAR \n Type !1 to start in the CAFE CAR \n Type !2 to start in the PANGOLIN CAR"}, {upsert: true}, function(err, newDoc){
//     console.log("err: " + err);
// });

// db.insert({type: "passage", path: "0", branches: "3", passage: "We begin on a train barrelling down House Orien's Lighning Rail Line. We are about to begin a journey of discovery... a journey of mystery... a journey of stupid shit, endless stupid shit. But first, which car should we go to? \n Type !0 to start in the PASSENGER CAR \n Type !1 to start in the CAFE CAR \n Type !2 to start in the PANGOLIN CAR"});

//no idea how to get rid of trash created while debugging
// db.remove({path: "01"});
// db.remove({path: "00"});
// db.remove({path: "02"});



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
    }
    if(msg.content === '!new'){ //start a new story in that channel

        //special role permission, no anyone can make a new story

        //if already a story in that channel TODO

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
    //TODO if startswith(), then go down, but if addtl after !start, check against path tags, else no story by that name.
    if(msg.content === '!start'){
        //if no story yet, prompt with !new
        db.find({channel: msg.channel.id}, function(err, docs){
            console.log("!start err: " + err);
            if(docs[0] == null){
                msg.channel.send('There\'s no story in this channel yet! Please type "!new" to create one.');
                return;
            } else { //good to go
                //if more than one story, need to ask which to play TODO
                // db.find({channel: msg.channel.id, path: }, function(err, docs){
                        //look up REGEX, see if you can only find paths with one number in the string (length 1?)
                
                    if(docs.length == 1){//only one story






                    } else {
                        let storyList = '';
                        docs.forEach() //send the user prompt for new !start
                    }
                
                // });

                //start the game for that user in their private messages
                msg.channel.send('starting! check your private messages please ~ * ~*');  
                client.users.cache.get(msg.author.id).send('welcome. here is your story:');
                
                //check all current stories and see if this user played before but didn't finish, delete that
                for(let i  = currentStories.length - 1; i >= 0; i--){
                    if(currentStories[i].player == msg.author.username){
                        currentStories.splice(i, 1);
                    }
                }
                let newPlaythrough = {
                    player: msg.author.username,
                    channel: msg.channel.id,
                    path: "0", //eventually will start diff stories depending on !start TODO
                    isWritingNewNode: false,
                    hasFinishedPassage: false
                }
                currentStories.push(newPlaythrough);

                db.find({path: "0"}, function(err, docs) {
                    client.users.cache.get(msg.author.id).send(docs[0].passage);
                });
            }
        });


    }
    //how to start on specific story?




    if (msg.channel.type == "dm") { //DM channel
        //first make sure it's not the bot
        if(msg.author.username == "CommunityCYOA") return;

        //find this users story
        let myStory;
        for(let i = 0; i < currentStories.length; i++){
            if(currentStories[i].player == msg.author.username) myStory = i; //first time using no {} in if statement...
        }
        console.log("mystory: " + myStory);
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
            db.find({$and: [{path: currentStories[myStory].path}, {branches: {$exists: true}}]}, function(err, docs){ // wait, why do i need $and? i don't right?
                console.log('branch err:' + err);
                console.log("docs:" + docs);
                branches = parseInt(docs[0].branches);
                // console.log(branches);
                // for(let j = 0; j < docs.length; j++){
                //     console.log("i: " + j + " branchnum: " + docs[j].branches);
                // }
                // return b;
                // wtf++;

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
                if(!hasStoryProgressed){
                    client.users.cache.get(msg.author.id).send('sorry, thats not an option I understand, please pick again');
                } else {
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
                db.update({path: currentStories[myStory].path}, {path: currentStories[myStory].path, passage: msg.content, branches: 0}, {upsert: true}, function(err, newDoc){ //not sure if it matters to update/upsert rather than just insert since if all works, there won't be a doc matching the query...
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