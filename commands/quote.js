const Discord = require('discord.js');
var { MessageEmbed } = require('discord.js');
var quotes = require("../../data/quotes.json");

module.exports = {
    desc:"Shows a featured qupte. Usage: >quote <number>",
    execute(client, message, param){
            var quote = quotes[parseInt(param[1])];
            if(quote != undefined && quote != null){
                var embed = new MessageEmbed()
                .setColor(quote.color)
                .setDescription(quote.desc)
                .setTitle(quote.title)
                .setThumbnail(quote.thumb)
                .setAuthor(quote.author, quote.avatar);
                message.channel.send({embed});
            }else{
                message.reply("invalid Quote id");
            }
    }
}
