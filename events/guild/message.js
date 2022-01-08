const config = require('../../config.json');    // importation du fichier de configuration du bot

const PREFIX = config.prefix;
const ROLEBOT = config.Moulinsard.role_bot;
const ROLEBOT_TEST = config.AgosJDR.role_bot;
const CHANNELBOT = config.Moulinsard.channel_bot;
const CHANNELBOT_TEST = config.AgosJDR.channel_bot;
//const cooldowns = new Map();

// recherche de la commande par le bot, et son application
module.exports = (Discord, bot, message) =>{
    
    // on verrifie que le message ne provienne pas du bot, qu'il commnce par le bon préfixe, qu'il s'aggisse d'un message par defaut et que l'utilisateur est le bon rôle associé
    if(!message.content.startsWith(PREFIX) || message.author.bot || message.type !== 'DEFAULT' || (!message.member.roles.cache.has(ROLEBOT) && !message.member.roles.cache.has(ROLEBOT_TEST))) return;
    
    if (message.channel != CHANNELBOT && message.channel != CHANNELBOT_TEST ){  
        // si on est dans le mauvais channel on informe l'utilisateur
        return message.channel.send("Je ne peux vous servir, vous n'êtes pas dans le bon channel."); 

    } else { 
                                                                             
        // sinon on récupère les arguments sous forme d'un tableau (sans le préfix)
        const args = message.content.slice(PREFIX.length).split(/ +/);
        const cmd = args.shift().toLowerCase(); // dont on extrait le nom de la commande
        // enfin on récupère la commande grâce à son nom ou à l'un de ses aliasses associés
        const command = bot.commands.get(cmd) || bot.commands.find(a => a.aliases && a.aliases.includes(cmd));

        // système de cool down pas encore terminé
        /*
        if(!cooldowns.has(command.name)){
            cooldowns.set(command.name, new Discord.Collection());
        }

        const currentTime = Date.now();
        const timeStamps = cooldowns.get(command.name);
        const cooldownAmuont = (command.cooldown)*1000;
        */

        try {                                   // on essaie d'executer la commande associée au nom inscrit par l'utilisateur
            command.execute(message, args, cmd, bot, Discord);
        } catch (err) {                         // si on a une erreur, on insert le message d'erreur dans le termina, puis on informe l'utilisateur
            message.channel.send("Je ne comprend pas ce que vous me demandez, êtes vous sur que je sache faire cela.");
            console.log(err);
        }
    }
}