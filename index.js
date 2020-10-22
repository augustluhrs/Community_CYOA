//database stuff
const Datastore = require('nedb');
// var db = new Datastore({filename: "dataTest.db", autoload: true});
var db = new Datastore({filename: "secret_stories/testStory.db", autoload: true});

db.update({type: "globalData"}, {$set: {"timeLastUsed": Date.now()}}, {upsert: true}, function(err, upsert){
    console.log("err: " + err);
    console.log("upsert: " + upsert);
});
//not sure why above is creating two diff docs with same id...

//i don't know how to just start the db with a story doc, when i tried adding it manually it got corrupted
db.update({type: "passage", path: "0", branches: "3", passage: "You begin at a crossroads. \n Type !0 to go LEFT \n Type !1 to go UP \n Type !2 to go RIGHT"}, {upsert: true}, function(err, newDoc){
    console.log("err: " + err);
});


// Discord stuff
const Discord = require('discord.js');
const client = new Discord.Client();

require('dotenv').config();

const serverID = process.env.SERVERID;
const channelID = process.env.CHANNELID;

//story user stuff
let currentStories = [];




client.once('ready', () => {
  console.log('Ready!');
});

client.login(process.env.TOKEN);
client.on('message', gotMessage);

function gotMessage(msg) {
//   console.log(msg);
  // Only for this server and this channel
//   if (msg.guild.id === serverID && msg.channel.id === channelID) {
  if (msg.channel.id === channelID) {
    if (msg.content === 'ping') {
      msg.channel.send('pong');
    }
    if(msg.content === '!help'){
        msg.channel.send('to start the story type "!start" and I\'ll send you a private message with the beginning of your story.');
    }
    if(msg.content === '!start'){
        //start the game for that user in their private messages

        msg.channel.send('starting! check your private messages please ~ * ~*');
        // console.log(msg.author.id);
        // client.users.cache.get(msg.author.id).send('hey there bb');

        // db.insert({name: msg.author.username, id: msg.author.id },
        //     function(err, newDocs){
        //         console.log('err: ' + err);
        //         console.log('newDocs: ' + newDocs);
        // });  
        /*
        db.find({type: "globalData"}, function(err, docs) { //why called docs? what's better name?
            console.log(docs[0].nodeNum);
            db.update(
                {_id: docs[0]._id}, 
                // {$set: {"nodeNum": docs.nodeNum++}} 
                {$inc: {"nodeNum": 1}},
                {upsert: true}
                //no callback for now?
            );
        });
        */
        client.users.cache.get(msg.author.id).send('welcome. here is your story:');
        
        //check all current stories and see if this user has already played, delete that
        for(let i  = currentStories.length - 1; i >= 0; i--){
            if(currentStories[i].player == msg.author.username){
                currentStories.splice(i, 1);
            }
        }
        let newStory = {
            player: msg.author.username,
            path: "0" //eventually will start diff stories depending on !start
        }
        currentStories.push(newStory);

        db.find({path: "0"}, function(err, docs) {
            client.users.cache.get(msg.author.id).send(docs[0].passage);
        });
    }
  } else if (msg.channel.type == "dm") { //DM channel
    //first make sure it's not the bot
    if(msg.author.username == "CommunityCYOA") return;

    //find this users story
    let myStory;
    for(let i = 0; i < currentStories.length; i++){
        console.log(".player: " + currentStories[i].player);
        console.log(".username: " + msg.author.username);

        if(currentStories[i].player == msg.author.username) myStory = i; //first time using no {} in if statement...
    }
    console.log("mystory: " + myStory);
    if(myStory == null) {
        //if they try to start from the dm
        client.users.cache.get(msg.author.id).send('something\'s wrong, please start from the server channel, not here.');
        return;
    }

    //adjust number of checks based on how many branches that story node has
    let branches;
    // let wtf = 0;
    console.log("current path: " + currentStories[myStory].path);
    //the function in db.find not working how i expect... it's going too slowly
    db.find({$and: [{path: currentStories[myStory].path}, {branches: {$exists: true}}]}, function(err, docs){
        console.log('branch err:' + err);
        console.log("docs:" + docs);
        branches = parseInt(docs[0].branches);
        console.log(branches);
        // for(let j = 0; j < docs.length; j++){
        //     console.log("i: " + j + " branchnum: " + docs[j].branches);
        // }
        // return b;
        // wtf++;

        //check for next story command
        let hasStoryProgressed = false;
        for(let b = 0; b < branches; b++){
            console.log("option: " + b);
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
                } else{
                    client.users.cache.get(msg.author.id).send(docs[0].passage);
                }
            });
        }
        });
    // console.log("b: " + branches);
    // console.log("wtf:" + wtf);
  }
}