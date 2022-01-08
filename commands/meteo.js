const discord = require('discord.js');
const weather = require('weather-js');

module.exports = {
    name: 'meteo',                                                      // module non fini 
    description: 'checking the weather of city',
    cooldown: 0,
    aliases: ['m', 'weather'],
    async execute (message, args, cmd, bot, Discord){
    
        const city = args.join(' ');    // on récupére les arguments que l'on met sous forme d'une string
        var bulletin;
        var nb_bulletin
        console.log("0");
        await weather.find({search: city, degreeType: 'C'},       // on recherche la météo de city
        (err, result) => {
            if(err){
                console.log(err);
                return message.channel.send("Ca ne marche pas ! Peut être n'avez vous pas bien écrit le nom de la ville ou oublié une majuscule?"); 
            }                                           // si on a une erreur, on l'affiche dans le terminal
            console.log("1");
            bulletin = JSON.stringify(result, null, 2);
            console.log("2");
            nb_bulletin = Object.keys(result).length;
            console.log("nb_bulletin" + nb_bulletin);   // sinon on affiche le json renvoyer par la fonction weather
            console.log("3");
        });

        try {
            console.log("4")
            if(nb_bulletin > 1){
                console.log("5")

                message.channel.send("Il y'a trop de bled avec ce nom, il me faut au moins le pays de la ville. Regardez plutôt:");
                let liste = "";
                bulletin.forEach(element => {
                    liste += " " + element.location;    
                });
                return message.channel.send(liste);
            }
            console.log("6")
            /*
            let embed = new discord.MessageEmbed()          // on créé un embed pour resortir les données de notre json
            .setTitle(`Météo - ${bulletin[0].location.name}`)
            .setColor("#20c0ff")
            //.setDescription("La température peut varier Temperature units can may be differ some time")
            .addField("Température", `${bulletin[0].current.temperature} Celcius`, true)
            .addField("Temps", bulletin[0].current.skytext, true)
            .addField("Humidité", bulletin[0].current.humidity, true)
            .addField("Vitesse du vent", bulletin[0].current.windspeed, true)//What about image
            //.addField("Observation Time", bulletin[0].current.observationtime, true)
            .addField("Direction du vent", bulletin[0].current.winddisplay, true)
            .setThumbnail(bulletin[0].current.imageUrl);
            
            message.channel.send(embed);*/
        } catch(err) {
            console.log(err);
            return message.channel.send("Je n'arrive pas à avoir la météo du lieu que vous avez entré.");

        }
    }
}