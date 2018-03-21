const Discord = require('discord.js');
const ffmpeg = require('ffmpeg');
const ytdl = require('ytdl-core');

const token = "NDI1NzMwMDIxMDI2NDMwOTc2.DZMmkA.PyamLlgpli87huQii-8lRlk3tYQ";
const prefix = "k-";

const bot = new Discord.Client();

var servers = {};

function play(connection, message) {
  var server = servers[message.guild.id];

  server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));

  server.queue.shift();

  server.dispatcher.on("end", function() {
    if (server.queue[0])
      play(connection, message);
    else
      connection.disconnect();
    }
  );
}

bot.login(token);

bot.on("ready", async () => {
  console.log('Bot ready!');

  try {} catch (e) {
    console.log(e.stack);
  }
});

bot.on('message', (message) => {
  if (!message.content.startsWith(prefix)) {
    if ((message.author.username) === "Pokécord") {
      if (message.embeds.length > 0) {
        let embed = message.embeds[0];
        let image_raw = embed.image.url;
        let image_url = image_raw.replace("https://cdn.bulbagarden.net/upload/", "");
        console.log(image_raw);
        console.log(image_url);
      }
    };
    return;
  };
  if (message.author.bot)
    return;

  let args = message.content.substring(prefix.length).split(" ");

  switch (args[0].toLowerCase()) {
    case "join":
      message.channel.send("HANH?");
      if (!message.member.voiceChannel) {
        message.channel.send("You need to be in a voice channel.");
        return;
      }
      let channel = message.member.voiceChannel;
      channel.join();
      break;
    case "ping":
      message.channel.send("Pong!");
      break;
    case "info":
      message.channel.send("Created by Alexander Goodman, VT, 2018");
      message.channel.send("Use 'k-' for prefix. Commands are info, ping, and join.");
    case "play":
      if (!args[1]) {
        message.channel.send("Gimme a link.");
        return;
      }
      if (!message.member.voiceChannel) {
        message.channel.send("You need to be in a voice channel.");
        return;
      }
      if (!servers[message.guild.id])
        servers[message.guild.id] = {
          queue: []
        };

      var server = servers[message.guild.id];

      server.queue.push(args[1]);

      if (!message.guild.voiceConnection)
        message.member.voiceChannel.join().then(function(connection) {
          play(connection, message);
        });

      break;
    case "skip":
      var server = servers[message.guild.id];
      if (server.dispatcher)
        server.dispatcher.end();
      break;

    case "stop":
      var server = servers[message.guild.id];

      if (message.guild.voiceChannel)
        message.guild.voiceConnection.disconnect();
      break;
    default:
      message.channel.send("Invalid command");
  }
});
