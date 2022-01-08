module.exports = (Discord, bot) =>{
    console.log('Bot Nestor paré !');
    // encsemble des actions permettant de s'assurer par des logs que le bot est connecté, et correctement configuere
    
    bot.user.setAvatar('./nestor.png')
    .then(()=> console.log("Je suis connecté avec mon image monsieur!"))
    .catch(console.error);
    
    bot.user.setStatus('online')
    .then(console.log('Disponible pour monsieur!'))
    .catch(console.error);

    bot.user.setActivity('A votre Service !', { type: 'WATCHING' })
    .then(presence => console.log(`Activité: ${presence.activities[0].name}`))
    .catch(console.error);
}