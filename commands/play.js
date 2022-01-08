const ytdl = require('ytdl-core');                  //importation de la librairie ytdl-core
const ytSearch = require('yt-search');              //importation de la librairie ytdl-search     

const queue = new Map();                            // création de notre queue, contenant en clé : message.guild.id ; et en objet associé l'objet : queueConstructor .
RESET = null;
// queue (message.guild.id, queueConstructor object {voice channel, text channel, connection, song[]})

module.exports = {
    name: 'play',
    description: 'play music in a channel',
    cooldown: 0,
    aliases: ['p',  'skip', 'sk', 'stop', 'st', 'leave', 'le', 'list', 'l', 'reset', 'r'],
    async execute (message, args, cmd, bot, Discord){

        
        if(cmd === 'reset' || cmd === 'r'){         // si la commande faite est reset ou son alias
            if(RESET){                              // et que RESET est activé (dû à une deconnexion forcé)
                queue.clear();                      // alors on clear la queue
                RESET = null;
                return message.channel.send('Le lecteur musical à été reset.');
            } else {
                return message.channel.send('Il n\'y a pas besoins de reset le lecteur.');
            }
        }

        const voiceChannel = message.member.voice.channel;  // on récupère l'id du channel voc dans lequel l'utilisateur est

        if(!voiceChannel){                                  // on verrifie que l'utilisateur est dans le dit channel vocal
            return message.channel.send('Vous n\'êtes pas connecté en vocal');
        }
        
        const permissions = voiceChannel.permissionsFor(message.client.user);   // on récupère l'état des permissions du bot sur le channel vocal

        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')){          // on verrifie qu'elles soient valides
            return message.channel.send('J\'ai besoin de la permession de vous rejoindre et de brancher les haut parleurs sur le channel.');
        }

        const serverQueue = queue.get(message.guild.id);    // on créé notre constante serverQueue, qui prend la valeur associé à la clé message.guild.id dans notre queue

        if(cmd === 'play' || cmd === 'p'){                  // on regarde quelle est envoyé par l'utilisateur
            if(!args.length){                               // on verrifie que l'utilisateur a envoyé un argument
                return message.channel.send('Vous ne m\'avez donné de music à lire.');
            }

            let song = {};                                  // on créé un objet pour notre music

            if(ytdl.validateURL(args[0])){                      // on verrifie si notre 1er argument est une url 
                const songInfo = await ytdl.getInfo(args[0]);   // on cherche la video associé à cette url
                song = {title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url}; // on associe à song le titre de la video et son url retrtouvé sur youtube
            } else {                                            // sinon:
                const videoFinder = async (query) => {      // fonction cherchant sur youtube à partir des mots clés entrés en arguments, le 1er résultat
                    const videoResult = await ytSearch(query);

                    return (videoResult.videos.length > 1) ? videoResult.videos[0]: null;
                }

                const video = await videoFinder(args.join(' ')); // on associe le resultat obtenue à video

                if (video){                                 // si celui-ci existe, alors on associe le resultat obtenue à song
                    song = {title: video.title, url: video.url};
                } else{                                     // sinon on prévient l'utilisateur qu'aucune vidéo correspondant au mots clés donné n'a pu être trouvé 
                    message.channel.send('Je n\'ai pas trouvé de resultat pour votre vidéo Youtube.')
                }
            }

            if(!serverQueue){                       // si serverQueue est null, autrement dit que queue n'a pas été instentié, alors:
                const queueConstructor = {          // on génére notre queueConstructor
                    voiceChannel: voiceChannel,
                    textChannel: message.channel,
                    connection: null,
                    songs: []
                }
    
                queue.set(message.guild.id, queueConstructor); // on instentie notre queue
                queueConstructor.songs.push(song);  // on instentie la variable queueConstructor.songs en lui ajoutant le morceau de musique song
    
                try{                                // on tente de connecter le bot au channel vocal, puis de lancé la lecture de la queue
                    const connection = await voiceChannel.join();
                    queueConstructor.connection = connection;
                    videoPlayer(message.guild, queueConstructor.songs[0]);
                } catch {
                    message.channel.send('Le cable de connexion est foutu je crois...');
                    queue.delete(message.guild.id);               
                    throw err;
                }               
            } else {                                // si notre serverQueue a déjà été créé, alors:
                if(!serverQueue.connection.dispatcher){
                    RESET = 1;
                    return message.channel.send('Veuillez reset le lecteur musical, un erreur est survenu.');
                }
                serverQueue.songs.push(song);       // on ne fait qu'ajouté une musique à notre serverQueue.songs
                return message.channel.send(`**${song.title}** a été ajouté à la lecture.`); // en informant l'utilisateur  
            }
        } else if(cmd === 'skip' || cmd === 'sk'){  // si notre commande est skip ou son alias, alors on appelle notre fonction associé à cette commande
            skipSong(message, serverQueue);         
        } else if(cmd === 'stop' || cmd === 'st' || cmd === 'leave'){  // si notre commande est stop ou son alias, alors on appelle notre fonction associé à cette commande
            stopSong(message, serverQueue);         
        } else if(cmd === 'list' || cmd === 'l'){   // si notre commande est list ou son alias, alors on appelle notre fonction associé à cette commande
            displayQueue(message, serverQueue);
        }
    }
}

const videoPlayer = async(guild, song) => {         // fonction permettant la lecture de nos musiques
    const songQueue = queue.get(guild.id);          // on recupère la clé de notre queue contenant les informations nécessaires à notre lecteur

    if(!song){
        songQueue.voiceChannel.leave();             // si notre objets songs ne contien plus de musique alors
        queue.delete(guild.id);                     // on supprime l'objet queue construtor, et donc le lecteur
        return songQueue.textChannel.send(':door: A plus tard.');       // en informant l'utilisateur
    }
    const stream = ytdl(song.url, {filter: 'audioonly'});   // sinon on lit la musique disponible sur le 1er element de songs
    songQueue.connection.play(stream, {seek: 0, volume: 1 })
    .on('finish', () => {
        songQueue.songs.shift();                    // on retire l'élément lu de l'objet songs
        videoPlayer(guild, songQueue.songs[0]);     // plus on effectue un appelle récursif sur la même fonction jusqu'à ce que songs soit vide
    });
    await songQueue.textChannel.send(`La musique joué est la suivante: **${song.title}**`); // on informe l'utilisateur la piste en cours de lecture

}

const skipSong = async(message, serverQueue) => {   // fonction permettant de passer une chanson
    if(!message.member.voice.channel){              // on verrifie que l'utilisateur est connecté en vocale
        return message.channel.send('Vous n\'êtes pas connecté en vocal');
    }
    if(!serverQueue){                               // on s'assure que le lecteur de music soit en cours d'utilisation
        return message.channel.send('Vous n\'avez même pas lancé de musique, je ne peux pas passer à la suivante.');
    }

    if(serverQueue.connection.dispatcher){          // on s'assure que le lecteur du videoPlayer soit tjrs existant
        serverQueue.connection.dispatcher.end();    // si oui on supprime la lecture en cours pour passer à la suivante
    } else {
        RESET = 1;                                  // sinon cela signifie que le bot a été déconnecté sans que la queue n'été clear
        return message.channel.send('Veuillez reset le lecteur musical, un erreur est survenu');    // on avertit l'utilisateur qu'il faut effectuer un reset
    }
}
const stopSong = async(message, serverQueue) => {   // fonction permettant d'arreté la lecture de la playlist
    if(!message.member.voice.channel){              // on verrifie que l'utilisateur est connecté en vocale
        return message.channel.send('Vous n\'êtes pas connecté en vocal.');
    }
    if(!serverQueue){                               // on s'assure que le lecteur de music soit en cours d'utilisation
        return message.channel.send('Vous n\'avez même pas lancé de musique, je ne peux pas la l\'arrêter.');
    }

    serverQueue.songs = [];                         // on vide l'objet songs
    if(serverQueue.connection.dispatcher){          // on s'assure que le lecteur du videoPlayer soit tjrs existant
        serverQueue.connection.dispatcher.end();    // si oui on supprime la lecture en cours pour passer à la suivante et donc par conséquent clear la queue et mettre fin à la connexion
    } else {
        RESET = 1;                                  // sinon cela signifie que le bot a été déconnecté sans que la queue n'été clear
        return message.channel.send('Veuillez reset le lecteur musical, un erreur est survenu.');   // on avertit l'utilisateur qu'il faut effectuer un reset
    }
}

const displayQueue = async(message, serverQueue) => { // fonction qui permet l'affichage des muisque enregistrer dans l'objet songs
    if(!message.member.voice.channel){              // on verrifie que l'utilisateur est connecté en vocale
        return message.channel.send('Vous n\'êtes pas connecté en vocal.');
    }
    if(!serverQueue){                               // on s'assure que le lecteur de music soit en cours d'utilisation
        return message.channel.send('Vous n\'avez même pas lancé de musique, je ne peux pas vous afficher les musiques suivantes.');
    }

    if(serverQueue.connection.dispatcher){          // on s'assure que le lecteur du videoPlayer soit tjrs existant
        let playlist = [];                          // on créé un objet playlist qui va contenirs tout les titre des éléments de l'objet songs 
        serverQueue.songs.forEach(song => {
            playlist += `- ${song.title} \n`;

        });                                         // puis on va l'afficher à l'utilisateur
        message.channel.send('Voici toutes les musiques que vous m\'avez demandé de lancer:\n'+ playlist);
    } else {
        RESET = 1;                                  // sinon cela signifie que le bot a été déconnecté sans que la queue n'été clear
        return message.channel.send('Veuillez reset le lecteur musical, un erreur est survenu');    // on avertit l'utilisateur qu'il faut effectuer un reset
    }
}

/*
npm i @discordjs/opus
npm i opusscript
npm i ffmpeg-static
npm i 'ytdl-core-discord'
*/