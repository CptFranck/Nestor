//initialisation de mon bot
const Discord = require('discord.js');      // importation de la librairie discord
const config = require('./config.json');    // importation du fichier de configuration du bot

const bot = new Discord.Client({            // création de mon client discord : bot
  fetchAllMembers: true
});

bot.commands = new Discord.Collection();    // création d'une liste de commande
bot.events = new Discord.Collection();      // création d'une liste des events

['command_handler','event_handler'].forEach(handler => {  // importation des modules
  require(`./handlers/${handler}`)(bot, Discord); // nécessaire aux commandes handler
})

bot.login(config.token);                    // connexion du bot

/*
//arrivé sur le server
bot.on('guildMemberAdd', member => {
  member.guild.channels.cache.get(config.gretings.channel).send(`Bienvenue à Moulinsard ${member}!`)
  member.roles.add(config.greetings.role)
});

//départ du server
bot.on('guildMemberRemove', member => {
  member.guild.channels.cache.get(config.greetings.channel).send(`Au revoir à Moulinsard ${member.user.tag}!`)
  member.roles.add(config.gretings.role)
});
*/