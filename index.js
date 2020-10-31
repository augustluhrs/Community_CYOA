///////////////////////////////////////////////////////////////  ///
//////////////////////////////////////////////////////////////  ///
/////////////////////////////////////////////////////////////  ///
/////////   Community Choose-Your-Own-Adventure    /////////  ///
///////////////////////////////////////////////////////////  ///
//////////////////////////////////////////////////////////  ///
/////////////////////////////////////////////////////////  ///
////////////////////////////////////////////////////////  ///
//////////    a discord bot by August Luhrs    ////////  ///
//////////////////////////////////////////////////////  ///
/////////////////////////////////////////////////////  ///
////////////////////////////////////////////////////  ///
///////////////////////////////////////////////////  ///
/////////////     special thanks to    ///////////  ///
//////////  Marie Claire LeBlanc Flanagan  //////  ///
////////////////////////////////////////////////  ///
///////////////////////////////////////////////  ///
//////////////////////////////////////////////  ///

/*
 * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ *
 *                  OVERVIEW
 *          
 *  Everything takes place within the message event.
 * 
 *  If the channel is initialized, the player can type
 *  messages in that channel to make new stories, 
 *  select which story to play, and call any other 
 *  commands (i.e !help). 
 * 
 *  Any messages sent from the player's private message 
 *  with the bot are read, but the bot only responds if 
 *  that player has !start-ed the story from the server.
 *  When the player starts the story, a new playthrough
 *  is pushed to the currentStories array. That array is
 *  where all the magic happens -- it's what's referenced
 *  and adjusted as the player goes through the story and
 *  how the bot knows which passage to find in the database.
 *  
 *  The story is represented most in the currentStories array
 *  by the "path" variable. You can imagine the path as
 *  the player's choices at each passage's branches laid 
 *  flat. For example:
 * 
 *                          Passage 0
 *                Branch 0, [Branch 1], Branch 2
 *                               |
 *                               |
 *                          Passage 01           
 *                      [Branch 0], Branch 1
 *                          |
 *                          |
 *                     Passage 010
 * 
 *      would be path: 010
 * 
 * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ *
*/

//database stuff
const Datastore = require('nedb');
var db = new Datastore({filename: "public/discordStories.db", autoload: true});

// Discord stuff
const Discord = require('discord.js');
const client = new Discord.Client();

//.env -- just for token, augustid
require('dotenv').config();

//story user stuff
let currentStories = [];

//timer for clearing currentStories
let timeSinceLastPlayed;
let clearTimer = 1000 * 60 * 60; //too lazy to find millis in an hour

setInterval( () => { //checks every hour, if no new players played that hour, clear currentStories
    if(Date.now() - timeSinceLastPlayed >= clearTimer){
        currentStories = [];
        console.log('clearing current stories');
    }
}, clearTimer);

//the starting functions, starts discord bot and listens for the messages
client.once('ready', () => {
  console.log('Ready!');
  timeSinceLastPlayed = Date.now(); //for clearing the currentStories array
});

client.login(process.env.TOKEN);
client.on('message', gotMessage);

function gotMessage(msg) {

    // ~ * ~ *    !init -- has to be called for the bot to listen in that channel ~ * ~ * ~ *

    if(msg.content === '!init channel'){
        //only admins and people with permissions can init the bot
        if(msg.channel.permissionsFor(msg.author.id).has('ADMINISTRATOR') || msg.channel.permissionsFor(msg.author.id).has('MANAGE_CHANNELS')){
            db.find({type: "channel", channel: msg.channel.id}, function (err, docs){
                if (docs.length == 0){
                    db.insert({type: "channel", channel: msg.channel.id});
                    msg.channel.send("Yay! This channel is now active and I'll be listening for story commands. Type `!help` for more info.")
                } else {
                    msg.channel.send("this channel has already been initialized.");
                }
            });
        }
    }

    // ~ * ~ *     kill bot and get feedback , but I'm the only one that can do it

    if(msg.content === '!kill bot' && msg.author.id === process.env.AUGUSTID){
        msg.channel.send("Did I do something wrong? I'm... sorr-\n\nBOT TERMINATED").then( () => {
            client.destroy();
            console.log("bot destroyed, exiting");
        });
    }

    if(msg.content === '!get feedback' && msg.author.id === process.env.AUGUSTID){
        db.find({type: "feedback"}, function(err, docs){
            console.log('feedback get err: ' + err);
            docs.forEach( (note) => {
                client.users.cache.get(msg.author.id).send(note.author + " @ " + note.time + " : " + note.feedback);
            });
        });
        return;
    }

    // ~ * ~ *    help commands, from channel or dms

    db.find({type: "channel", channel: msg.channel.id}, function (err, docs){ 
        if (docs.length != 0 || msg.channel.type == "dm"){ //!help from init channel or dms

            //no idea why \n\ was adding such weird spaces in discord, using "template literal"? now
            //main help section
            if(msg.content === '!help'){ 
                msg.channel.send(`hello! here\'s a list of commands I know:
                \`!start\` : lists the stories ready to play in this channel [channel only]
                \`!start STORYNAME\` : starts a new playthrough of that story in your private messages (case sensitive) [channel only]
                \`!new STORYNAME\` : creates a new story in that channel with the name STORYNAME [channel only]
                \`!edit\` : [currently disabled] allows administrators or those with channel permissions to edit stories from their PMs  [admins or channel managers only]
                \`!help\` : brings up this exact message...
                \`!help story\` : brings up more instructions about how to play through a story
                \`!help about\` : gives you an overview of what this is all about!
                \`!feedback\` : sends a message to your PM so you can report bugs, give notes, request features, etc.
                \`!init channel\`: activates the channel you send this from, you have to do this before the bot will work in any channel [admins or channel managers only]
                \`!remove channel\`: de-activates the channel so the bot won't work on it anymore [admins or channel managers only]
                Thanks!`);
            }

            //story help section
            if(msg.content === '!help story'){ 
                msg.channel.send(`To play a story, type \`!start\` to see what the current stories in this channel are.
                Once you know the title of the story you want to play, type \`!start\` followed by that story\'s name.

                For example, if I have a story called "My Story", I\'d type \`!start My Story\`. Keep in mind spaces and capitalization.
                Then I\'ll send you a private message to start the story.

                Once in your PMs, you can read one passage at a time then navigate to the next part of the story by
                using the commands \`!0\`,\`!1\`, and so on, depending on which path you want to go down.

                Some paths lead to empty ends, which are blank passages that no one has written yet -- that means it\'s your turn to write them!
                First, you\'ll write just the passage, so just the story and no choices branching off of it.
                Then, after you send me that, I\'ll ask you for the choices one at a time. Just type the word or phrase associated with that choice, i.e. "Go left" or "Say hi to the sentient chair".
                I\'ll automatically add the \`!n\` commands. Once you\'ve sent me each choice branching off from that passage, type \`END\` to finish the process. That\'s it!`);
            }

            //about help section -- overview
            if(msg.content === '!help about'){ 
                msg.channel.send(`Hi! This is a discord bot about making a collaborative Choose-Your-Own-Adventure game.
                From any channel in this server, you can create stories for anyone in that channel to read and play.
                Once a story is created, it will start completely blank. The first passage in the story is written by the first person to !start that story.

                A player navigates through the different branches or choices of the story until they reach a part of the story no one has written yet.
                They\'ll then be instructed to write that next passage and the choices that branch off from it.

                Note: Right now all stories are public on the github server, don\'t type any stories with personal information!
                Also this is in very early development, things may change drastically and stories may not be saved from update to update, sorry about that!

                This discord bot was made by August Luhrs @augustluhrs or @deadaugust
                based on a idea from Marie Claire LeBlanc Flanagan @omarieclaire
                hosted on Glitch.com
                GitHub Repo at https://github.com/augustluhrs/Community_CYOA -- feel free to make pull requests or fork to make your own bots!
                Thanks so much for playing!`);
            }
        }
    });

    // ~ * ~ *    all commands sent from channel

    db.find({type: "channel", channel: msg.channel.id}, function (err, docs){ //make sure the channel has been initialized
        // console.log("valid channel err: " + err);
        if (docs.length != 0){
            // classique
            if (msg.content === 'ping') {
                msg.channel.send('pong');
            }

            //if they try and create a story with no name
            if(msg.content == '!new') { 
                msg.channel.send("to create a new story, type `!new` followed by the name of your new story. Like this: `!new My Story`.\n Keep in mind this is the title players will type every time they play the story, so don't make it too long!");
            }

            // create a new story in that channel
            if(msg.content.startsWith('!new ')){  
                let newStoryName = msg.content.substr(5);
                console.log("new Story Name: " + newStoryName);
                let numStories;
                //check to make sure it's not a duplicate, then add it to the db with the default keys
                db.find({type:"story", channel: msg.channel.id}, function(err, docs){
                    console.log("new story err: " + err);
                    numStories = docs.length.toString();
    
                    for(let i = 0; i < docs.length; i++){
                        if (docs[i].name == newStoryName){
                            msg.channel.send('sorry, a story in this channel already has that name. Please pick a new name.');
                            return;
                        }
                    }
                    //starting num of the path is how many stories in the channel thus far
                    db.insert({type: "story", channel: msg.channel.id, path: numStories, name: newStoryName, branches: "1", passage: "Welcome to " + newStoryName + "! Please type `!0` to begin."});
    
                    msg.channel.send('Successfully created new story: ' + newStoryName);
                });
            }

            // start edit process if has admin powers -- send to DMs
            if(msg.content === '!edit'){
                if(msg.channel.permissionsFor(msg.author.id).has('ADMINISTRATOR') || msg.channel.permissionsFor(msg.author.id).has('MANAGE_CHANNELS')){
                    msg.channel.send('Starting edit process in your private messages.');
                    //EDIT TODO
                    client.users.cache.get(msg.author.id).send('sorry i don\'t know how to edit yet ._.\'');
                } else {
                    // console.log(msg.channel.permissionsFor(msg.author.id));
                    msg.channel.send('Sorry you don\'t have permission to do that, you need to have ADMINISTRATOR or MANAGE_CHANNELS permissions.');
                }
            }

            // remove channel -- stops bot from listening to channel but doesn't erase stories
            if(msg.content === '!remove channel'){
                if(msg.channel.permissionsFor(msg.author.id).has('ADMINISTRATOR') || msg.channel.permissionsFor(msg.author.id).has('MANAGE_CHANNELS')){
                    msg.channel.send('Fine. I didn\'t want to be here anyway.\n\n NOTE: This does not erase the stories in this channel, it only prevents me from listening to commands until someone says `!init channel` again');
                    db.remove({type: "channel", channel: msg.channel.id}, {}, function(err, num){ //not sure why need the middle {} but it's in the documentation
                        console.log('remove channel err: ' + err);
                        console.log('channels removed: ' + num);
                    })
                } else {
                    // console.log(msg.channel.permissionsFor(msg.author.id));
                    msg.channel.send('Sorry you don\'t have permission to do that, you need to have ADMINISTRATOR or MANAGE_CHANNELS permissions.');
                }
            }

            // give feedback -- well, just a prompt to get them to do it from their dm's
            if(msg.content === '!feedback'){
                msg.channel.send('Thanks! Sending you a private message now so you can tell me what\'s up.');
                client.users.cache.get(msg.author.id).send("So what's on your mind? Type `!feedback` followed by whatever you want to tell me -- bugs, notes, comments, questions, concerns, ideas, confessions, revelations, whatever you want! Thanks!");
            }
        
            // start a new playthrough of a story
            if(msg.content.startsWith('!start')){
                //if no story yet, prompt with !new
                db.find({type: "story", channel: msg.channel.id}, function(err, docs){
                    console.log("!start err: " + err);
                    if(docs[0] == null){
                        msg.channel.send('There\'s no story in this channel yet! Please type `!new STORYNAME` to create one.');
                        return;
                    } else { //good to go
    
                        let storyName = msg.content.substr(7);
                        console.log("story Name: " + storyName);
                        db.find({channel: msg.channel.id, type: "story", name: storyName }, function(err, docs){
                        
                            if(docs.length == 1){//only one story
                                msg.channel.send('starting! check your private messages please ~ * ~ *');  
                                console.log("docs story name: " + docs[0].name);

                                //player playthrough added to the currentStories array
                                let newPlaythrough = {
                                    player: msg.author.username,
                                    channel: msg.channel.id,
                                    path: docs[0].path,
                                    isWritingNewNode: false,
                                    hasFinishedPassage: false
                                }
                                currentStories.push(newPlaythrough);

                                //reset timer
                                timeSinceLastPlayed = Date.now();
    
                                //send the player the beginning of the story
                                client.users.cache.get(msg.author.id).send(docs[0].passage);
    
                            } else { //no story by that name or they didn't include one
                                msg.channel.send('Which story would you like to play? Type `!start` followed by one of the following story names: \n');
                                db.find({channel: msg.channel.id, type: "story"}, function(err, docs){
                                    console.log('listing story names err: ' + err);
                                    docs.forEach(doc => msg.channel.send(doc.name + "\n")); 
                                });
                            }
                        });
                    }
                });
            }
        }
    });

    // ~ * ~ *    all commands sent in DMs on playthrough

        
    if (msg.channel.type == "dm") { //DM channel
        //first make sure it's not the bot
        if(msg.author.username == "CommunityCYOA") return;

        //if they're sending feedback
        if(msg.content.startsWith('!feedback')){
            let newFeedback = msg.content.substr(9);
            db.insert({type: "feedback", feedback: newFeedback, author: msg.author.username, time: Date.now()}); //should this be anon? maybe change in future. not getting channel either.
            client.users.cache.get(msg.author.id).send("your feedback has been received, thanks so much!");
            return; //will this mess with the db function?
        }

        //find this users playthrough
        let myStory;
        for(let i = 0; i < currentStories.length; i++){
            if(currentStories[i].player == msg.author.username) myStory = i; // weird way to only get the latest story playthrough
        }
        if(myStory == null) { //if they try to start from the dm, they won't have a playthrough ready
            client.users.cache.get(msg.author.id).send('we can\'t meet here like this, what would the others think? please start from the server channel, not here.');
            return;
        }

        if(!currentStories[myStory].isWritingNewNode){ //if still going through story

            //find the passage they're on
            db.find({channel: currentStories[myStory].channel, path: currentStories[myStory].path}, function(err, docs){ 
                console.log('branch err:' + err);

                let hasStoryProgressed = false;
                let branches;
                if(docs.length != 0){ //have to do this in case they stop halfway through or type rando choices at beginning
                    branches = parseInt(docs[0].branches); //adjust number of checks based on how many branches that story node has

                    //check to see if they've chosen a new branch of the story from that passage
                    for(let b = 0; b < branches; b++){
                        if(msg.content == "!" + b){ 
                            //check to make sure no other player is currently on that node to prevent overwriting new nodes
                            let isOverlap = false;
                            for(let p = 0; p < currentStories.length; p++){
                                if(currentStories[p].path == currentStories[myStory].path && currentStories[p].id != currentStories[myStory].id){
                                    client.users.cache.get(msg.author.id).send('sorry, someone else is currently on that part of the story. wait a bit for them to finish or please pick another option.');
                                    isOverlap = true;
                                }
                            }
                            if(!isOverlap){
                                console.log('branch chosen: ' + b);
                                currentStories[myStory].path = currentStories[myStory].path.concat(b);
                                hasStoryProgressed = true;
                            }
                        }
                    }
                }
                if(!hasStoryProgressed){ //if they don't type a correct command
                    client.users.cache.get(msg.author.id).send('sorry, thats not an option I understand, please try again.');
                } else { //progress story, send next passage or prompt for new one if they reach an empty
                    db.find({path: currentStories[myStory].path, finished: true}, function(err, docs){ //finished tag nice because will overwrite any abandoned passages
                        console.log("next section err: " + err);
                        if(docs[0] == null){
                            //new node in the story, trigger prompt
                            client.users.cache.get(msg.author.id).send("You've reached a blank story node! You get to write this next section. \nPlease type out the next passage of this story, and then I will ask you what you want the options branching out from that passage to be. Just make sure if you want to add a new paragraph, you SHIFT-ENTER, as pressing ENTER will submit the passage.");
                            currentStories[myStory].isWritingNewNode = true;
                        } else{
                            //send the next passage
                            client.users.cache.get(msg.author.id).send(docs[0].passage);
                        }
                    });
                }
            });
        } else { //is writing a new story node
            if(!currentStories[myStory].hasFinishedPassage){ //has written passage, update the doc
                console.log('new story from ' + currentStories[myStory].player + " at " + currentStories[myStory].path + ": " + msg.content);
                
                db.update({path: currentStories[myStory].path}, {type: "passage", channel: currentStories[myStory].channel, path: currentStories[myStory].path, passage: msg.content, branches: 0, finished: false}, {upsert: true}, function(err, newDoc){ //not sure if it matters to update/upsert 
                    console.log("new story node err: " + err);
                });

                currentStories[myStory].hasFinishedPassage = true;
                client.users.cache.get(msg.author.id).send('Now I\'ll ask you for the choices branching out from this new passage. \n What\'s option one? Type it in the chat (you don\'t have to worry about the `!0` `!1` .. etc., just write out the choice. For example "Go Right")');
            } else { //finished passage, now update the branches
                if(msg.content == "END" || msg.content == "end" || msg.content == "End" || msg.content == "end " || msg.content == "END "){ //gotta be a better way to do this.
                    client.users.cache.get(msg.author.id).send('Thanks for playing! Go back to the server channel whenever you want to play again.');
                    //updating the finished key, if they never get here the passage gets overwritten
                    db.update({path: currentStories[myStory].path}, {$set: {finished: true}});

                    //go back and bold the branch choice that led here
                    let thisPath = currentStories[myStory].path;
                    let lastBranch = thisPath[thisPath.length - 1]
                    let lastPath = thisPath.substr(0, thisPath.length - 1);

                    if(lastPath.length > 1){ //not changing the first passages b/c no ~*
                        db.find({path: lastPath}, function(err, docs){
                            let prevPassage = docs[0].passage;
                            //find the string in the previous passage that comes after the chosen branch
                            let choiceIndex = prevPassage.search("!" + lastBranch); //really needs to be choice Index + 6 for "!b` : "
                            let endIndex = prevPassage.indexOf("    ~*", choiceIndex);
                            let lastChoice = prevPassage.substring(choiceIndex + 6, endIndex); //substr start to length, substring start to end
                            //need to add specifically to that option, in case they're repeating words in multiple options
                            let thatOption = prevPassage.substring(choiceIndex, endIndex + 6); //now adding +6 because "    ~*"
                            let boldOption = thatOption.replace(lastChoice, "**" + lastChoice + "**");
                            let boldPassage = prevPassage.replace(thatOption, boldOption);
                            db.update({path: lastPath}, { $set: {passage: boldPassage}}); //needs set or interprets as new doc

                            //this is not optimized, reseting a player's playthrough is messy now that i'm timer clearing not splicing the array
                            //put this in here so it would happen after using the path to find the last path
                            currentStories[myStory].isWritingNewNode = false;
                            currentStories[myStory].hasFinishedPassage = false; //had to do this again to prevent never ending story?? early exit caused bug -- edit: might have been fixed by adding finished tag but idk
                            currentStories[myStory].path = null; //if not, can just keep typing commands to continue story after finishing passage
                        });
                    }
                } else { // if they're adding new branch choices to their new passage

                    //so rn, if they type end as first choice, it becomes a dead end. fine?

                    db.find({path: currentStories[myStory].path}, function(err, doc){
                        console.log("passageFind err: " + err);

                        db.update({path: currentStories[myStory].path}, { 
                            $set: {
                                passage: doc[0].passage.concat("\n\n `!" + doc[0].branches + "` : " + msg.content + "    ~*") //adding ~* to find where to stop bolding
                            },
                            $inc: {
                                branches: 1 //so it knows which !n corresponds to which branch choice (set ^ above with doc[0].branches)
                            }
                        }, function(err, newDocs){
                            console.log("option err: " + err);
                        });
                    });
                    client.users.cache.get(msg.author.id).send('Great. Type in the next option or type `END` to finish.');
                }
            }
        }
    }
}

// hello!