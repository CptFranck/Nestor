const fs = require('fs');                   // importation de la librairie fs

module.exports = (bot, Discord) => {        // chargement de toutes les commandes existantes de notre bot
    const commandsFile = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
    
    for(const file of commandsFile){
        const command = require(`../commands/${file}`);
        if(command.name){
            bot.commands.set(command.name, command);
        } else {
            continue;
        }
    }

}