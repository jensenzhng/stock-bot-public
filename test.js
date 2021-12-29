const fs = require('fs');

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
    }
    return new Promise((resolve, reject) => {
        resolve(channels);
    })
}

async function bruh() {
    let bruh = await getChannel("stock");
    console.log(bruh);
}

bruh();