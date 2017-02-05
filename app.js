/*
  A ping pong bot, whenever you send "ping", it replies "pong".
*/

// import the discord.js module
const Discord = require('discord.js');

// create an instance of a Discord Client, and call it bot
const bot = new Discord.Client();

// the token of your bot - https://discordapp.com/developers/applications/me
const config = require("./config.json");

var MongoClient = require('mongodb').MongoClient;

bot.on('ready', () => {
  console.log('I am ready!');
});

// create an event listener for messages
bot.on('message', message => {
  if (message.author.bot) return; // stops bot from replying to itself
  if (!message.content.startsWith(config.prefix)) return;
  let command = message.content.split(" ")[0];
  command = command.slice(config.prefix.length);
  let args = message.content.split(" ").slice(1);

  if (command === 'ping') {
    // send "pong" to the same channel.
    message.channel.sendMessage('asd');
  }

  var workout;
  var canditochannel = bot.channels.find("name", "canditoprogram");
  var canditorole = message.guild.roles.find("name", "Candito");
  console.log(message.member.id);
  if (command === "test") {
    canditochannel.sendMessage(`${canditorole} + aas`);
  }

  if (command === "workout") {
    message.author.sendMessage("```hi```");
  }

  if (command === "stats") {
      if(!args[2])  {
        message.channel.sendMessage('Enter your stats in the format: "!stats (bench) (squat) (deadlift)"');
        return;
      }


      // Connect to the db
      MongoClient.connect("mongodb://localhost:27017/DiscordDB", function(err, db) {
      if(!err) {
        console.log("We are connected");
        var collection = db.collection('users');
        var name = {name:message.member.id};
        var info = {name:message.member.id, bench:args[0], squat:args[1], deadlift:args[2]}
        collection.update(name, info, {upsert : true});
        message.channel.sendMessage('Your stats have been inserted/updated!');
        console.log('Inserted');
      }
      })
  }

  if (command === "showstats") {
    MongoClient.connect("mongodb://localhost:27017/DiscordDB", function(err, db) {
    if(!err) {
      console.log("We are connected");
      var collection = db.collection('users');
      collection.find({name:message.member.id}, {bench : 1, squat : 1, deadlift :1, _id:0}).nextObject(function(err, results) {
        oldWord = results;
        message.author.sendMessage(`Your stats are` + "```" + `Bench: ${results.bench}, Squat: ${results.squat}, Deadlift: ${results.deadlift}` + "```");
      });
    }
  });
  }

  if (command === "t") {
    MongoClient.connect("mongodb://localhost:27017/DiscordDB", function(err, db) {
    if(!err) {
      console.log("We are connected");
      var collection = db.collection('candito');
      collection.find({name:3}).nextObject(function(err, results) {
        for(var key in results.squat) {
          if(results.squat.hasOwnProperty(key)){
            console.log(results.squat[key]);}}
      });
    }
  });
  }

});



// log our bot in
bot.login(config.token);
