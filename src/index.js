const { Client, GatewayIntentBits, Collection} = require("discord.js");
const fs = require('fs');
const path = require('path');

require('dotenv').config({
    path: `${__dirname}/config.env`
  });

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent] });

client.commands = new Collection();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for(file of functions){
        console.log(file);
        require(`./functions/${file}`)(client);
    }
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token);
})();

client.on('interactionCreate', async(interaction) =>{
    if(!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if(!command)return;
    try{
        await command.execute(interaction,client);
    }catch(error){
        console.error(error);
        await interaction.reply({
            content: 'There was a error while running the command.',
            ephemeral: true
        });
    }
})