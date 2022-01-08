const fs = require('fs');

module.exports = (bot, Discord) => {        // chargement de tous les events existant de notre bot
    const load_dir = (dirs) => {
        const eventFiles = fs.readdirSync(`./events/${dirs}`).filter(file => file.endsWith('.js')); // lecture des fichers correspondant aux events

        for(const file of eventFiles){
            const event = require(`../events/${dirs}/${file}`);
            const eventName = file.split('.')[0];
            bot.on(eventName, event.bind(null, Discord, bot));  // on assimile chacun des fichiers lus à une fonction, elle-même associée au bot
        }
    }

    ['bot','guild'].forEach(e => load_dir(e));  // application la fonction précédente au deux répertoires bot et guild
}