const cron = require('node-cron');
const config = require('../config.json');   // importation du fichier de configuration du bot
var bool = 0;                               // module non fini   
module.exports = {
    name: 'setimgnasa',
    description: 'Activer la l\'auromatisation de la requete NASA',
    cooldown: 0,
    aliases: ['sin','stin', 'din'],
    async execute (message, args, cmd, bot, Discord){
    
        var task = cron.schedule('1 * * * *', () => {
            console.log('running every minute 1');
            const cmd = 'naza';
            const command = bot.commands.get(cmd);
            command.execute(message, args, cmd, bot, Discord);
        });
        
        if (bool == 0){
            task.start();
            message.channel.send('La Nasa nous prépare ses photos.');
        } 
        if (bool == 1){
            task.stop();
            message.channel.send('La Nasa met ses préparatifs en pause.');
        }
        if (cmd == 'DIN' && bool == 1){
            task.destroy();
            message.channel.send('La Nasa a mis fin à son service.');
        }
    }
}