//database stuff
const Datastore = require('nedb');
// var db = new Datastore({filename: "dataTest.db", autoload: true});
var db = new Datastore({filename: "secret_stories/testStory.db", autoload: true});

db.update({type: "globalData"}, {$set: {"timeLastUsed": Date.now()}}, {upsert: true}, function(err, upsert){
    console.log("err: " + err);
    console.log("upsert: " + upsert);
});
//not sure why above is creating two diff docs with same id...

// Discord stuff
const Discord = require('discord.js');
const client = new Discord.Client();

require('dotenv').config();

const serverID = process.env.SERVERID;
const channelID = process.env.CHANNELID;

client.once('ready', () => {
  console.log('Ready!');
});

client.login(process.env.TOKEN);
client.on('message', gotMessage);

function gotMessage(msg) {
  console.log(msg.content);
  // Only for this server and this channel
//   if (msg.guild.id === serverID && msg.channel.id === channelID) {
  if (msg.channel.id === channelID) {
    if (msg.content === 'ping') {
      msg.channel.send('pong');
    }
    if(msg.content === '!start'){
        msg.channel.send('starting!');
        // console.log(msg.author.id);
        // client.users.cache.get(msg.author.id).send('hey there bb');

        // db.insert({name: msg.author.username, id: msg.author.id },
        //     function(err, newDocs){
        //         console.log('err: ' + err);
        //         console.log('newDocs: ' + newDocs);
        // });

        // db.find({},function(err, docs) { //why called docs? what's better name?
        //     for(var i = 0; i < docs.length; i ++){
        //         //need to make sure everything added has a type
        //         if(docs[i].type == "globalData"){
        //             console.log("count: " + docs[i].nodeNum);
                    
        //         }
        //     }
    // })   
        
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
        // client.users.cache.get(msg.author.id).send('hey there bb');


    }
  }
}