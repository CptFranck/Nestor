module.exports = {
    name: 'bjr',
    description: 'dis bonjour',
    async execute (message, args, cmd, bot, Discord){
        message.channel.send('Bonjour, que puis-je pour vous ? !');
    }
}