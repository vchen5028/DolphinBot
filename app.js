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
  var workout;
  var canditochannel = bot.channels.find("name", "canditoprogram");
  var canditorole = message.guild.roles.find("name", "Candito");

  if (command === 'ping') {
    // send "pong" to the same channel.
    message.channel.sendMessage('Test!');
  }

  if (command === 'commands') {
    message.channel.sendMessage('``` !showstats ``` Show you your bench/squat/deadlift stats. ``` !inputstats [bench] [squat] [deadlift] ``` Update your stats onto the database. ``` !workout [week] [day] ``` Get your workout for the week/day.');
  }

  console.log(message.member.id);
  if (command === "test") {
    canditochannel.sendMessage(`${canditorole} + aas`);
  }

  if (command === "inputstats") {
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

  if (command === "workout") {
    MongoClient.connect("mongodb://localhost:27017/DiscordDB", function(err, db) {
      if(!err) {
        console.log("We are connected");
        var candito = db.collection('candito');
        var users = db.collection('users');
        var commandArgs = {week:parseInt(args[0]), day:parseInt(args[1])};
        candito.find(commandArgs).nextObject(function(err, results) {
          users.find({name:message.member.id}, {bench : 1, squat : 1, deadlift :1, _id:0}).nextObject(function(err, stats) {
            if(results == null) { message.channel.sendMessage('No workout on Week ' + args[0] + ' Day ' + args[1]); return; }
            var msg = ('Your workout for Week ' + args[0] + ' Day ' + args[1] + ' is:' + "``` ");
            if(results.squat) {
              var concatMsg = "Squat: "
              for(var key in results.squat) {
                if(results.squat.hasOwnProperty(key)) {
                  concatMsg = concatMsg.concat(round5(results.squat[key]*stats.squat).toString(), results.squatreps[key], " ");
                }
              }
              msg = msg.concat(concatMsg, '\n');
            }
            if(results.bench) {
              var concatMsg = "Bench: "
              for(var key in results.bench) {
                if(results.bench.hasOwnProperty(key)) {
                  concatMsg = concatMsg.concat(round5(results.bench[key]*stats.bench).toString(), results.benchreps[key], " ");
                }
              }
              msg = msg.concat(concatMsg, '\n');
            }
            if(results.deadlift) {
              var concatMsg = " Deadlift: "
              for(var key in results.deadlift) {
                if(results.deadlift.hasOwnProperty(key)) {
                  concatMsg = concatMsg.concat(round5(results.deadlift[key]*stats.deadlift).toString(), results.deadliftreps[key], " ");
                }
              }
              msg = msg.concat(concatMsg, '\n');
            }
            if(results.extra) {
              var concatMsg = ' Accessories \n';
              for(var key in results.extra) {
                if(results.extra.hasOwnProperty(key)) {
                  concatMsg = concatMsg.concat(" ", results.extra[key], '\n');
                }
              }
              msg = msg.concat(concatMsg, '\n');
            }
            var msgEnd = ("```");
            msg = msg.concat(msgEnd);
            message.author.sendMessage(msg);
          });
        });
      }
    });
  }

});



// log our bot in
bot.login(config.token);

function round5(x)
{
    return Math.round(x/5)*5;
}
