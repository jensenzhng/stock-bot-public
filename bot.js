const fs = require('fs');
const Discord = require('discord.js');
const bot = new Discord.Client();

async function addChannel(channelID, msg, type) {
    if (bot.channels.cache.get(channelID) === undefined) {
        msg.channel.send(`\`${channelID}\` is not a valid channel that the bot is in.`)
    } else {
        let channels = await getChannel(type);
        if (channels.channelIDS.indexOf(channelID) === -1) {
            channels.channelIDS += `,${channelID}`
            msg.channel.send(`added channel with id \`${channelID}\` to list of channels in which ${type} calls will be sent.`);
            let finalType = await getType(type);
            fs.writeFileSync(finalType, JSON.stringify(channels));
        } else {
            msg.channel.send(`channel alr in list of channels in which ${type} calls will be sent`);
        }

    }
}

async function removeChannel(channelID, msg, type) {
    let channels = await getChannel(type);
    if (channels.channelIDS.includes(channelID)) {
        channels.channelIDS = channels.channelIDS.replace(`,${channelID}`, ``);
        let finalType = await getType(type);
        fs.writeFileSync(finalType, JSON.stringify(channels));
        msg.channel.send(`removed ${channelID} from list of channels that ${type} calls will be sent to`)
    } else {
        msg.channel.send(`that channel is not in the list of current channels`)
    }
}

async function getChannel(type) {
    let channels;
    switch (type) {
        case "stock":
            channels = JSON.parse(fs.readFileSync('./stockChannels.json'));
            break;
        case "option":
            channels = JSON.parse(fs.readFileSync('./optionChannels.json'));
            break;
        case "crypto":
            channels = JSON.parse(fs.readFileSync('./cryptoChannels.json'));
            break;
        case "watchlist":
            channels = JSON.parse(fs.readFileSync('./watchlistChannels.json'));
            break;
    }
    return new Promise((resolve, reject) => {
        resolve(channels);
    })
}

async function getType(type) {
    let temptype;
    switch (type) {
        case "stock":
            temptype = './stockChannels.json'
            break;
        case "option":
            temptype = './optionChannels.json';
            break;
        case "crypto":
            temptype = './cryptoChannels.json';
            break;
        case "watchlist":
            temptype = './watchlistChannels.json';
            break;
    }
    return new Promise((resolve, reject) => {
        resolve(temptype);
    })
}

async function getRoleName(type, guildID) {
    let role;
    switch (type) {
        case "stock":
            role = "stocks";
            break;
        case "option":
            role = "options";
            break;
        case "crypto":
            role = "crypto";
            break;
        case "watchlist":
            role = "stocks";
            break;
    }
    return new Promise((resolve, reject) => {
        resolve(role);
    })
}

async function sendCalls(msg, type, buyOrSell) {
    let channels = await getChannel(type);

    let channelsArray = channels.channelIDS.split(',');
    if (channelsArray.length > 1) {
        for (var i = 1; i < channelsArray.length; i++) {
            let channel = bot.channels.cache.get(channelsArray[i]);
            let messageAttachment = msg.attachments.size > 0 ? msg.attachments.array()[0].url : null;
            let roleName = await getRoleName(type, channel.guild);
            let role = channel.guild.roles.cache.find(role => role.name === roleName);

            let messageEmbed = new Discord.MessageEmbed()
                .setColor(buyOrSell)
                .setTimestamp()
                .setFooter('Confirmed Calls • Remember to manage your risk accordingly! This is not financial advice.', 'https://cdn.discordapp.com/attachments/841747028597800991/843158303806193664/obito.gif');

            if (messageAttachment) {
                messageEmbed.setImage(messageAttachment);
            }

            if (msg.content !== "") {
                messageEmbed.setDescription(msg.content.replace('.buy ', '').replace('.sell ', ''));
            }

            if (role !== undefined) {
                channel.send(`<@&${role.id}>`)
            }

            await channel.send(messageEmbed).catch(err => { console.log(err) });
        }
        await msg.channel.send(`Sent call to \`${channelsArray.length-1}\` channels`)
    }
}

bot.on('ready', () => {
    console.log(`logged in as ${bot.user.tag}, ready to send calls`);
})

bot.on('message', async msg => {
    if (msg.author.id === bot.user.id) {
        return;
    }

    //stock call
    if (msg.channel.id === '841747741499588668') {
        if (msg.content.startsWith('.buy')) {
            sendCalls(msg, "stock", '#00ff00');
        } else if (msg.content.startsWith('.sell')) {
            sendCalls(msg, "stock", '#ff0000');
        } else {
            sendCalls(msg, "stock", '#8c00ff');
        }
    }

    //option call
    if (msg.channel.id === '841866723698540574') {
        if (msg.content.startsWith('.buy')) {
            sendCalls(msg, "option", '#00ff00');
        } else if (msg.content.startsWith('.sell')) {
            sendCalls(msg, "option", '#ff0000');
        } else {
            sendCalls(msg, "option", '#8c00ff');
        }
    }

    //crypto call
    if (msg.channel.id === '841866795136581643') {
        if (msg.content.startsWith('.buy')) {
            sendCalls(msg, "crypto", '#00ff00');
        } else if (msg.content.startsWith('.sell')) {
            sendCalls(msg, "crypto", '#ff0000');
        } else {
            sendCalls(msg, "crypto", '#8c00ff');
        }
    }

    if (msg.channel.id === '843168389316083732') {
        if (msg.content.startsWith('.buy')) {
            sendCalls(msg, "watchlist", '#00ff00');
        } else if (msg.content.startsWith('.sell')) {
            sendCalls(msg, "watchlist", '#ff0000');
        } else {
            sendCalls(msg, "watchlist", '#8c00ff');
        }
    }


    if (msg.author.id === '304764339410305036' || msg.author.id === '611012357425987615') {
        if (msg.content.startsWith('.add') && msg.content.split(' ').length === 2) {
            if (msg.channel.id === '841747672351244340') {
                addChannel(msg.content.split(' ')[1], msg, "stock");
            } else if (msg.channel.id === '841747681398620190') {
                addChannel(msg.content.split(' ')[1], msg, "option");
            } else if (msg.channel.id === '841747691158372392') {
                addChannel(msg.content.split(' ')[1], msg, "crypto");
            } else if (msg.channel.id === '843168358119374890') {
                addChannel(msg.content.split(' ')[1], msg, "watchlist");
            }
        }

        if (msg.content.startsWith('.remove') && msg.content.split(' ').length === 2) {
            if (msg.channel.id === '841747672351244340') {
                removeChannel(msg.content.split(' ')[1], msg, "stock");
            } else if (msg.channel.id === '841747681398620190') {
                removeChannel(msg.content.split(' ')[1], msg, "option");
            } else if (msg.channel.id === '841747691158372392') {
                removeChannel(msg.content.split(' ')[1], msg, "crypto");
            } else if (msg.channel.id === '843168358119374890') {
                removeChannel(msg.content.split(' ')[1], msg, "watchlist");
            }
        }

        if (msg.content === '.current') {
            let stockChannels = JSON.parse(fs.readFileSync('./stockChannels.json'));
            let cryptoChannels = JSON.parse(fs.readFileSync('./cryptoChannels.json'));
            let optionChannels = JSON.parse(fs.readFileSync('./optionChannels.json'));
            let watchlistChannels = JSON.parse(fs.readFileSync('./watchlistChannels.json'))
            if (stockChannels.channelIDS.length > 1) {
                msg.channel.send(`stock channels: ${stockChannels.channelIDS.slice(1)}`);
            }

            if (cryptoChannels.channelIDS.length > 1) {
                msg.channel.send(`crypto channels: ${cryptoChannels.channelIDS.slice(1)}`);
            }

            if (optionChannels.channelIDS.length > 1) {
                msg.channel.send(`option channels: ${optionChannels.channelIDS.slice(1)}`);
            }

            if (watchlistChannels.channelIDS.length > 1) {
                msg.channel.send(`watchlist channels: ${watchlistChannels.channelIDS.slice(1)}`);
            }
        }
    }
});

bot.login('').catch(err => {
    console.log(err.message);
});