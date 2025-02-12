const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yes')
        .setDescription('This is a ping command'),
    execute (interaction, client){
        interaction.reply({content: 'pong!'});
    }
}