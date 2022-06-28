const { Client } = require('../../dist/index.js');
const bot = new Client('user', 'pass');
bot.on('ready', () => {
    console.log("Bot is ready.")
});
bot.on('msg', async m => {
    if (m.content == "!ping") {
        m.send("Pong!")
    }
})
bot.start();
