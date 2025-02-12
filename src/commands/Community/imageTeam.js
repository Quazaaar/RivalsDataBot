const { SlashCommandBuilder, EmbedBuilder, inlineCode } = require("discord.js");
const axios = require('axios');
const Tesseract = require('tesseract.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('image-team')
        .setDescription('Search for a users stats using a screenshot of their team')
        .addAttachmentOption((option)=>option
            .setName("image-attachment")
            .setDescription("Enter a screenshot of the team you want to lookup")
            .setRequired(true))
        .addStringOption((option)=> option
            .setName('image-url')
            .setDescription("Attach a image URL")),

    async execute (interaction, client){
        const {options} = interaction;
        const image = options.getString('image-url');
        const attachment = options.getAttachment('image-attachment');

        //var playerProfileHandled;
        //var playerProfile;

        var teamDataArr = [];
        async function getPlayerProfile(BASE_URL, username) {
            await axios.get(`${BASE_URL}/player/${username}`, {
                headers: { 'x-api-key': process.env.mrtapikey }
            }).then(response => {
                //playerProfileHandled = true;
                //playerProfile = response.data;
                console.log("good boy");
                teamDataArr.push([response.data, true]);
            
            }).catch(error => {
                console.log('invalid profile');
                teamDataArr.push[null, false];
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
                await interaction.deferReply({ content: '', embeds: [embed], emphermal: true })
            } else{
                await interaction.deferReply({ embeds: [embed], emphermal: true })
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
        var teamArr = morphedName.split('\n');        
        /* setTimeout(async()=> {
            for(let i = 0; i < teamArr.length; i++){
                updatePlayerProfile(process.env.mrtapihtml, teamArr[i].replace(/ /g, '%20'));
            }
        }, 1000); */

        for(let i = 0; i < teamArr.length; i++){
            if(teamArr[i].length > 3){
                await getPlayerProfile(process.env.mrtapihtml, teamArr[i].replace(/ /g, '%20'));
            }
        }

        setTimeout(async()=> {

            var avaliableTeamData = [];

            //Algorithm here-------
            for(let i = 0; i < teamDataArr.length; i++){
                if(teamDataArr[i][1] == true){
                    var bestHero1 = 0;
                    var bestHero2 = 0;
                    var bestHero3 = 0;
                    for(let j = 0; j < teamDataArr[i][0].heroes_ranked.length; j++){
                        if(teamDataArr[i][0].heroes_ranked[j].matches > teamDataArr[i][0].heroes_ranked[bestHero1].matches){
                            bestHero3 = bestHero2;
                            bestHero2 = bestHero1;
                            bestHero1 = j;
                        }else if(teamDataArr[i][0].heroes_ranked[j].matches > teamDataArr[i][0].heroes_ranked[bestHero2].matches){
                            bestHero3 = bestHero2;
                            bestHero2 = j;
                        }else if(teamDataArr[i][0].heroes_ranked[j].matches > teamDataArr[i][0].heroes_ranked[bestHero3].matches){
                            bestHero3 = j;
                        }
                    }
                    avaliableTeamData.push([teamDataArr[i][0],bestHero1,bestHero2,bestHero3]);
                }else{
                    avaliableTeamData.push([null,-1,-1,-1])
                }
            }
            
            //------------

            embed = new EmbedBuilder()
            .setColor('Blurple')
            .setTitle('Team Data')
            .setDescription("Summary of avaliable data")
            //ranked[bestCharIndex].hero_name
            .setTimestamp();

            for(let i = 0; i < avaliableTeamData.length; i++){
                if(avaliableTeamData[i][0] != null){
                    embed.addFields(
                        {name: `${avaliableTeamData[i][0].player.name}`, value: ' '},
                        {name: 'First Character', value: `${avaliableTeamData[i][0].heroes_ranked[avaliableTeamData[i][1]].hero_name}: ${avaliableTeamData[i][0].heroes_ranked[avaliableTeamData[i][1]].matches} `, inline: true},
                        {name: 'Second Character', value: `${avaliableTeamData[i][0].heroes_ranked[avaliableTeamData[i][2]].hero_name}: ${avaliableTeamData[i][0].heroes_ranked[avaliableTeamData[i][2]].matches} `, inline: true},
                        {name: 'Third Character', value: `${avaliableTeamData[i][0].heroes_ranked[avaliableTeamData[i][3]].hero_name}: ${avaliableTeamData[i][0].heroes_ranked[avaliableTeamData[i][3]].matches} `, inline: true},
                    )
                }else{
                    embed.addFields({name: 'No data', value: 'noting', inline: true});
                }
            }
            await interaction.followUp({content: '', embeds: [embed]});
        }, 5000);
    }
    
}