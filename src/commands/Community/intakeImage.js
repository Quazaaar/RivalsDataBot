const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Tesseract = require('tesseract.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("intake-image")
        .setDescription('Submit a image to the bot')
        .addAttachmentOption((option) => option
            .setName('image-attachment')
            .setDescription("attach image to scan")
            .setRequired(true))
        .addStringOption((option)=> option
            .setName('image-url')
            .setDescription("Attach a image URL")),

    async execute (interaction, client){
        const {options} = interaction;
        const image = options.getString('image-url');
        const attachment = options.getAttachment('image-attachment');

        async function sendMessage(message, edit){
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle("Intake Image")
            .setDescription(message)
            .setTimestamp();
            if(edit){
                await interaction.editReply({ content: '', embeds: [embed], emphermal: true })
            } else{
                await interaction.reply({ embeds: [embed], emphermal: true })
            }
        }

        if(!image && !attachment){ return await sendMessage('You must use at least one input option')}

        await sendMessage('Loading, takes about 5 seconds');

        var input;
        if(attachment){
            input = attachment.url;
        }else{
            input = image;
        }

        //
        const eText = await Tesseract.recognize(input, 'eng', { logger: m => console.log(m) })
            .then(({ data: { text } }) => {
                console.log(text);
                return text
            });
        
        var spliced = eText.split('\n');
        spliced = spliced.filter(Boolean);
        
        setTimeout(async()=> {
            if(spliced.length > 0){
                embed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle('Image to text')
                .setImage(input)
                .setDescription('Image to text')
                .addFields({
                    name: spliced[0], value: 'data look up', inline: true
                })
                .setTimestamp()
            }else{
                embed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle('NOTING :hearbreak:')
                .setImage(input)
                .setDescription('I HAVE NOTING')
                .setTimestamp()
            }
            await interaction.editReply({content: '', embeds: [embed]});      
        }, 500);
    }
}