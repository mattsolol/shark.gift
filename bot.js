require('dotenv').config();
const Discord = require('discord.js');
const createCaptcha = require('./captcha');
const mysql = require('mysql');
const steamdb = require('steamdb-js');
const { create } = require('jimp');
const { connect } = require('http2');
const util = require('util');

const client = new Discord.Client();
const prefix = 's!';

const cooldown = new Set();

const versionNumber = "v0.3.0";

const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'keybot',
    charset: 'utf8mb4'
});

const createKeys = `create table if not exists newgamekeys(
    id int primary key auto_increment,
    name varchar(255) not null,
    gamekey varchar(255) not null
)`;

connection.connect (function(err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    else {
        console.log('Shark connected to database successfully!');
    }

    connection.query(createKeys, function(err, results, fields) {
        if (err) {
            console.log(err.message);
        }

        else {
            console.log('Made table successfully!');
        }
    });
});


client.on('ready', () => {
    console.log('Shark ready to gift.');
    client.user.setActivity('with sharks', { type: 'PLAYING' });

    const announcementEmbed = new Discord.MessageEmbed()
    .setColor('#ff33be')
    .setAuthor('shark.gift', 'https://i.imgur.com/clq66rW.jpg')
    .setTitle('Update! **v0.3.0 Changelog!**')
    .addFields(
        { name: "Captchas are now sent in embeds!", value: 'Captchas are now sent in a simillar fashion to other messages! Gone are the ugly normal image uploads! *yuck*' },
        { name: "Cooldowns! (beta)", value: "Introducing cooldowns! Keys *should* only be claimable once an hour per person! (if the time is longer or shorter than an hour, please contact Mattso)" }
    )
    .setTimestamp()
    .setFooter('shark.gift ' + versionNumber + ' (c) Mattso, 2020');
    client.channels.cache.get('741032535407984640').send(announcementEmbed);
});

client.on('message', async msg => {
    if (msg.content.startsWith(prefix)) {
        const input = msg.content.slice(prefix.length).trim().split(' ');
        const command = input.shift();
        const commandArgs = input.join(' ');

     if(command === 'givekey') {
            const gamekeyId = commandArgs;
            if (cooldown.has(msg.author.id)) {
                const giveKeyCooldownMsg = new Discord.MessageEmbed()
                .setColor('#ff33be')
                .setAuthor('shark.gift', 'https://pbs.twimg.com/media/EhetgLfXkAAJShP?format=jpg&name=small')
                .setTitle("Don't be greedy!")
                .addFields(
                    { name: "**Cooldown!**", value: "It would appear you have already claimed a key in the last hour!" }
                )
                .setTimestamp()
                .setFooter('shark.gift ' + versionNumber + ' (c) Mattso, 2020');
                msg.channel.send(giveKeyCooldownMsg);
                } else {
            console.log('Captcha created for ' + msg.member.user.tag);
            const captcha = await createCaptcha();
            msg.reply('To get game, Shark want Captcha. Check DMs for Captcha.');
            try {
                const attachment = new Discord.MessageAttachment(`${__dirname}/captchas/${captcha}.png`, `${captcha}.png`)
                const captchaEmbed = new Discord.MessageEmbed()
                .setColor('#ff33be')
                .setAuthor('shark.gift', 'https://pbs.twimg.com/media/EhetgLfXkAAJShP?format=jpg&name=small')
                .setTitle('**Shark want captcha!**')
                .attachFiles(attachment)
                .setImage(`attachment://${captcha}.png`)
                .setTimestamp()
                .setFooter('shark.gift ' + versionNumber + ' (c) Mattso, 2020');

                const mesg = await msg.author.send(captchaEmbed);
                
                try {
                    const filter = m => {
                        if(m.author.bot) return;
                        if(m.author.id === msg.author.id && m.content === captcha) {
                            return true;
                        } else {
                            m.channel.send('Captcha entered incorrectly! Shark want captcha. Try again.');
                            return false;
                        }
                    };
    
                    const response = await mesg.channel.awaitMessages(filter, { max: 1, time: 50000, errors: ['time']});
                    const keyId = commandArgs;
                    connection.query("SELECT * FROM newgamekeys WHERE id = ? LIMIT 1", [keyId], function (err, result) {
                        if (err) throw err;
                        console.log(result);
                        const giveKeyEmbed = new Discord.MessageEmbed()
                            .setColor('#ff33be')
                            .setAuthor('shark.gift', 'https://pbs.twimg.com/media/EhetgLfXkAAJShP?format=jpg&name=small')
                            .setTitle('Thank for captcha')
                            .addFields(
                                { name: "SharkDB ID", value: keyId },
                                { name: 'Game Title:', value: result[0].name },
                                { name: 'Game Key', value: result[0].gamekey },
                                { name: 'Cooldown', value: 'An hour cooldown has now been added to your account. **You will be DMed when you can claim another key**' }
                            )
                            .setTimestamp()
                            .setFooter('shark.gift ' + versionNumber + ' (c) Mattso, 2020');
                        msg.author.send(giveKeyEmbed);
                    });
                    connection.query("DELETE FROM newgamekeys WHERE id = ?", [keyId], function (err, result) {
                        msg.author.send('Deleting game from database...');
                        if (err) throw err;
                        console.log(result)
                        msg.author.send('Key successfully deleted from database!');
                        cooldown.add(msg.author.id);
                        setTimeout(() => {
                            cooldown.delete(msg.author.id);
                            console.log('Cooldown has been removed from ' + msg.author.username);
                            const cooldownRemovedEmbed = new Discord.MessageEmbed()
                            .setColor('#ff33be')
                            .setAuthor('shark.gift', 'https://pbs.twimg.com/media/EhetgLfXkAAJShP?format=jpg&name=small')
                            .setTitle('Cooldown Removed!')
                            .addFields(
                                { name: "Hi " + msg.author.username + "!", value: "Your cooldown has been removed! You can now claim another key!" }
                            )
                            .setTimestamp()
                            .setFooter('shark.gift ' + versionNumber + ' (c) Mattso, 2020');
                            msg.author.send(cooldownRemovedEmbed);
                        }, 3600000);
                    });
                    }
                
                catch(err) {
                    console.log(err);
                    mesg.channel.send('Time is up! Shark no like captcha anymore. Please re-enter the command and try again.')
                }
            }
    
            catch(err) {
                console.log(err);
            }
        }
        } else if(command === 'addkey') {
            if(msg.channel.type == "text") {
                msg.channel.bulkDelete(1);
                msg.reply("To prevent key stealing, shark cannot accept keys from a server! Please try again in a DM.");
            } else {

            const splitArgs = commandArgs.split(' ');
            var keyName = splitArgs.shift();
            const keyKey = splitArgs.join(' ');

            keyName = keyName.split('_').join(' ');

            try {
                connection.query(`INSERT INTO newgamekeys(name, gamekey) VALUES (?, ?)`, [keyName, keyKey], err => {
                    if(err){
                        console.log(err);
                        msg.reply('Shark has encountered an error! Please try again, if the problem is persisting, Shark suggests contacting Mattso');
                    }
                });

                msg.reply('Success! ' + keyName + ' was added to the database!');
                console.log(msg.author.tag + ' has added ' + keyName + ' to the database!');
                connection.query('SELECT id, name FROM newgamekeys WHERE name = ?', [keyName], (err, res) => {
                    const newKeyEmbed = new Discord.MessageEmbed()
                    .setColor('#ff33be')
                    .setAuthor('shark.gift', 'https://pbs.twimg.com/media/EhetgLfXkAAJShP?format=jpg&name=small')
                    .setTitle('New Key in SharkDB!')
                    .addFields(
                        { name: "SharkDB ID", value: res[0].id },
                        { name: 'Game Title:', value: keyName },
                        { name: 'Want to see more keys?', value: 'Use s!listkeys to get a list of all the available keys!' },
                    )
                    .setTimestamp()
                    .setFooter('shark.gift ' + versionNumber + ' (c) Mattso, 2020');
                    client.channels.cache.get('741032535407984640').send(newKeyEmbed);
                });
            }
            catch(err) {
                console.log(err);
                msg.author.send('Key ' + keyName + ' failed to add to the database, Shark suggests trying again or telling Mattso to check the bot logs.');
                }
            }
    } else if(command === 'listkeys') {
        if(msg.channel.type == "text") {
            var rowNum = -1;
            console.log(msg.author.tag + ' has requested access to the keylist from ' + msg.guild.name);
            connection.query("SELECT id, name FROM newgamekeys", (err, result, fields) => {
            if (err) throw err;
            const listKeysEmbed = new Discord.MessageEmbed()
            .setColor('#ff33be')
            .setAuthor('shark.gift', 'https://pbs.twimg.com/media/EhetgLfXkAAJShP?format=jpg&name=small')
            .setTitle('Available Keys')
            .setTimestamp()
            .setFooter('shark.gift ' + versionNumber + ' (c) Mattso, 2020');
            result.forEach(resultNumber => {
                rowNum++
                listKeysEmbed.addFields(
                    { name: result[rowNum].name, value: 'SharkDB ID: ' + result[rowNum].id }
                );
            });
            msg.channel.send(listKeysEmbed);
            });
    } else {
        msg.reply("This command can only be used in servers to prevent spam and make getting keysfair for everyone.");
    }
} else if(command === 'help') {
    const helpEmbed = new Discord.MessageEmbed()
        .setColor('#ff33be')
        .setAuthor('shark.gift', 'https://pbs.twimg.com/media/EhetgLfXkAAJShP?format=jpg&name=small')
        .setTitle('Ya want help?')
        .addFields(
            { name: 's!help', value: 'Displays this message' },
            { name: 's!addkey (GameName) (GameKey)', value: 'PLEASE REPLACE ALL SPACES IN THE TITLE WITH _ e.g. Minecraft_Pocket_Edition Portal_2 etc.! PLEASE DO NOT PUT SPACES IN THE KEY! ONLY WORKS IN DMs! Adds a game key to the SharkDB.' },
            { name: 's!listkeys', value: 'ONLY WORKS IN SERVERS! Displays all games that are currently available in the SharkDB.' },
            { name: 's!givekey (SharkDB ID)', value: 'PROCESS CAN ONLY BEGIN IN SERVERS! Sends a Captcha to the user, once completed the requested game key is given to the user and then deleted from the SharkDB. (SharkDB codes can be found with s!listkeys)' },
        )
        .setTimestamp()
        .setFooter('shark.gift ' + versionNumber + ' (c) Mattso, 2020');
        msg.channel.send(helpEmbed);
}
}
});

client.login('NzkyMTA1MTU2MDk0ODUzMTIw.X-Y3aQ.OSBdSNvUXjwEpV-IL8zmlgI72s4');