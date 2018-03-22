const moment = require('moment');

var util = require("../../utilities.js")

module.exports = {
    desc:"This is a description",
    async execute(client, message, param){
        var embed = {
            timestamp: message.createdTimestamp, 
            author: {
                name: message.author.displayName,
                icon_url: message.author.displayAvatarURL(),               
            },
            footer:{

            }
        }

        if(client.data.exp[message.author.id].lastDaily == "Not Collected" || moment.duration(moment().diff(moment(client.data.exp[message.author.id].lastDaily,"YYYY-MM-DD kk:mm"))).asHours() >= 24){
            client.data.exp[message.author.id].lastDaily = moment().format("YYYY-MM-DD kk:mm");
            client.data.exp[message.author.id].money += 2000;
            await util.save(client.data.exp,"exp"); 
            
            embed.fields= [{
                name: "Daily collection",
                value: `**You got 💴 2000! New Balance:** ${client.data.exp[message.author.id].money}`
            }]
            embed.color= 3446302
            embed.footer.icon_url= "https://i.imgur.com/OWk7t7b.png"
        }else{ 
            embed.footer.icon_url= "https://i.imgur.com/6zXSNu5.png"
            embed.color= 0                                                              
            embed.title= `**You already collected your daily reward! Collect your next reward** in ${24 - Math.floor(moment.duration(moment().diff(moment(client.data.exp[message.author.id].lastDaily,"YYYY-MM-DD kk:mm"))).asHours())} hours.`;                     
        }

        return message.channel.send({embed:embed})

        /*//XXXXXXXX BALANCE FOR STAFF MEMBERS------             
        if (message.member.roles.find("name", "Staff Team")) {                          
            embed.footer.text = "Fandom Bank (Staff Member 🔰)"
            return message.channel.send({embed:embed})                 
        }
        //XXXXXXXX BALANCE FOR PATRONS-----              
        else if (message.member.roles.find("name", "✨ Patreons")) { 
            embed.footer.text = "Fandom Bank (Patron ✨)"
            return message.channel.send({embed:embed})
        }
        //XXXXXXXX BALANCE FOR VETERANS------                 
        else if (message.member.roles.find("name", "🍙 - Veterans")) {                
            embed.footer.text = "Fandom Bank (Veteran 🍙)"
                return message.channel.send({embed:embed})
            }
        //XXXXXXXX BALANCE FOR MEMBERS------                  
        else if (message.member.roles.find("name", "🍧 - Members")) {               
            embed.footer.text = "Fandom Bank (Member 🍧)"
                return message.channel.send({embed:embed})
        }    
        //XXXXXXXX BALANCE FOR STAFF CUSTOMERS-----                                  
        else if (message.member.roles.find("name", "☕ - Customers")) {
            embed.footer.text = "Fandom Bank (Customer ☕)"
            return message.channel.send({embed:embed})
        }else {
            return message.channel.send(`**You are missing a role - please contact the staff**`)
        };*/
    }
}
