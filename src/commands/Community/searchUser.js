const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require('axios');
const fs = require('node:fs');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('search-user')
        .setDescription('Search for a users stats')
        .addStringOption((option)=>option
            .setName("name-input")
            .setDescription("Enter name of person you want to lookup")),

    async execute (interaction, client){
        const {options} = interaction;
        const name = options.getString('name-input');

        var playerProfileHandled;
        var playerProfile;

        async function getPlayerProfile(BASE_URL, username) {
            await axios.get(`${BASE_URL}/player/${username}`, {
                headers: { 'x-api-key': process.env.mrtapikey }
            }).then(response => {
                playerProfileHandled = true;
                playerProfile = response.data;
            }).catch(error => {
                playerProfileHandled = false;
                console.log(error.response);
            });
        }
        
        async function sendMessage(message, edit){
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle(name)
            .setDescription(message)
            .setTimestamp();
            if(edit){
                await interaction.editReply({ content: '', embeds: [embed], emphermal: true })
            } else{
                await interaction.reply({ embeds: [embed], emphermal: true })
            }
        }

        await sendMessage('Generating data');

        var morphedName = name;
        morphedName.replace(/ /g, '%20');
        
        await getPlayerProfile(process.env.mrtapihtml, morphedName)
        setTimeout(async()=> {
            if(playerProfileHandled === true){

                //Algorithm here-------
                var bestHero = 0;
                for(let i = 0; i < playerProfile.heroes_ranked.length; i++){
                    if(playerProfile.heroes_ranked[i].matches > playerProfile.heroes_ranked[bestHero].matches){
                        bestHero = i;
                    }
                }
                //------------

                embed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle(name)
                .setDescription(`${name}'s stats`)
                .addFields({
                    name: 'Best Characters', value: `${playerProfile.heroes_ranked[bestHero].hero_name}: ${playerProfile.heroes_ranked[bestHero].matches} `, inline: true
                })//ranked[bestCharIndex].hero_name
                .setTimestamp()
            }else{
                embed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle('NOTING :hearbreak:')
                .setDescription('I HAVE NOTING')
                .setTimestamp()
            }
            await interaction.editReply({content: '', embeds: [embed]});
        }, 5000);
    }
    
}