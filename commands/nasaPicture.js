const discord = require('discord.js');
const XMLHttpRequest = require('xhr2');
const config = require('../config.json');    // importation du fichier de configuration du bot

const REQUEST = new XMLHttpRequest();
const URL = "https://api.nasa.gov/planetary/apod?api_key=";
const API_KEY = config.nasa.token;

module.exports = {
    name: 'nasa',
    description: 'Afficher une image de l\'espace',
    cooldown: 0,
    aliases: ['n'],
    async execute (message, args, cmd, bot, Discord){
                
        REQUEST.open("GET", URL + API_KEY, true);
        REQUEST.onload = function () {
            // Begin accessing JSON data here
            
            if (REQUEST.status >= 200 && REQUEST.status < 400) {    // on s'assure que notre requête s'est executée correctement

                const response = JSON.parse(REQUEST.responseText);

                console.log("status: " + REQUEST.status);
                console.log("ready state: " + REQUEST.readyState);
                console.log(response);

                try {
                    let bool = 0;
                    let embed = new discord.MessageEmbed();         // on créé un embed pour resortir les données de notre json
                    embed.setTitle(`Photo du jour - ${response.title}`);   
                    embed.setColor("#20c0ff");
                    embed.setDescription(response.explanation);
                    embed.addField("Date", `${response.date}`, true);
                    if(response.media_type == "video"){             // si l'illustration est une video youtube alors on enrécupère la miniature

                        //line de la miniature
                        //https://img.youtube.com/vi/${video_id}/hqdefault.jpg
                        //http://img.youtube.com/vi/[video-id]/[thumbnail-number].jp

                        //lien sans l'embed
                        //https://www.youtube.com/watch?v=CC7OJ7gFLvE
                        
                        var video_id = response.url.split('https://www.youtube.com/embed/','?');

                        if(video_id != null){   
                            embed.setImage(`https://img.youtube.com/vi/${video_id}/hqdefault.jpg`);
                            embed.addField("url", `https://www.youtube.com/watch?v=${video_id}`, true);
                        } else {
                            embed.addField("url", `${response.url}`, true);
                        }

                    } else {
                        embed.setImage(response.url);
                    }

                    message.channel.send(embed);
                        
                } catch(err) {
                    console.log(err);
                    return message.channel.send("Il y a un bug dans la matrice.");
                }

            } else {
                console.log(REQUEST.status);
                console.log(REQUEST.readyState);
                message.channel.send("La NASA est injoignable ... étonnant non ?");
            }
        }
        
        REQUEST.send();

    }
}