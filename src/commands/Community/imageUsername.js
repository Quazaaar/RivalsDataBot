const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require('axios');
const Tesseract = require('tesseract.js');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('image-username')
        .setDescription('Search for a users stats using a screenshot of their name')
        .addAttachmentOption((option)=>option
            .setName("image-attachment")
            .setDescription("Enter a screenshot of person you want to lookup")
            .setRequired(true))
        .addStringOption((option)=> option
            .setName('image-url')
            .setDescription("Attach a image URL")),

    async execute (interaction, client){
        const {options} = interaction;
        const image = options.getString('image-url');
        const attachment = options.getAttachment('image-attachment');

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
                
        async function updatePlayerProfile(BASE_URL, username){
            await axios.get(`${BASE_URL}/player/${username}/update`, {
                headers: { 'x-api-key': process.env.mrtapikey }
            }).then(response => {
                console.log('player profile updated');
            }).catch(error => {
                playerProfileHandled = false;
                console.log(error.response);
            });
        }

        async function sendMessage(message, edit){
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle("Image intake")
            .setDescription(message)
            .setTimestamp();
            if(edit){
                await interaction.editReply({ content: '', embeds: [embed], emphermal: true })
            } else{
                await interaction.reply({ embeds: [embed], emphermal: true })
            }
        }

        if(!image && !attachment){ return await sendMessage('You must use at least one input option')}

        await sendMessage('Generating data');

        var input;
        if(attachment){
            input = attachment.url;
        }else{
            input = image;
        }

        const name = await Tesseract.recognize(input, 'eng', { logger: m => console.log(m) })
                    .then(({ data: { text } }) => {
                        console.log(text);
                        return text
                    });

        var morphedName = name;
        morphedName.replace(/ /g, '%20');
        
        setTimeout(async()=> {
            updatePlayerProfile(process.env.mrtapihtml, morphedName);
        }, 1000);

        await getPlayerProfile(process.env.mrtapihtml, morphedName);



        setTimeout(async()=> {
            if(playerProfileHandled === true){
                //Algorithm here-------
                var bestHero1 = 0;
                var bestHero2 = 0;
                var bestHero3 = 0;
                for(let i = 0; i < playerProfile.heroes_ranked.length; i++){
                    if(playerProfile.heroes_ranked[i].matches > playerProfile.heroes_ranked[bestHero1].matches){
                        bestHero3 = bestHero2;
                        bestHero2 = bestHero1;
                        bestHero1 = i;
                    }else if(playerProfile.heroes_ranked[i].matches > playerProfile.heroes_ranked[bestHero2].matches){
                        bestHero3 = bestHero2;
                        bestHero2 = i;
                    }else if(playerProfile.heroes_ranked[i].matches > playerProfile.heroes_ranked[bestHero3].matches){
                        bestHero3 = i;
                    }
                }
                //------------

                embed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle(name)
                .setDescription(" ")
                .addFields({
                    name: 'First Character', value: `${playerProfile.heroes_ranked[bestHero1].hero_name}: ${playerProfile.heroes_ranked[bestHero1].matches} `},
                    {name: 'Second Character', value: `${playerProfile.heroes_ranked[bestHero2].hero_name}: ${playerProfile.heroes_ranked[bestHero2].matches} `},
                    {name: 'Third Character', value: `${playerProfile.heroes_ranked[bestHero3].hero_name}: ${playerProfile.heroes_ranked[bestHero3].matches} `},
                )//ranked[bestCharIndex].hero_name
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