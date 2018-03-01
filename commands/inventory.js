var json = require("jsonfile");
const Discord = require('discord.js');

module.exports = {
    desc:"Displays your bought items",
    execute(client, message, param){
            var inventory = json.readFileSync("../data/inventory.json");
            var exp = json.readFileSync("../data/exp.json");
            var items = json.readFileSync("../shiro/Storage/items.json");

            var inventoryEmbed = new Discord.MessageEmbed();
            inventoryEmbed.color= message.member.displayColor;

            inventoryEmbed.author = {
                name: message.member.displayName,
                icon_url: message.author.displayAvatarURL(),
            }

            if (message.member.roles.exists("name", "Staff Team")) {   
                inventoryEmbed.footer= {
                    icon_url: "https://i.imgur.com/nIiVFxH.png",
                    text: "Fandom Bank (Staff Member 🔰)",
                }
            }
            //XXXXXXXX BALANCE FOR PATRONS------      
            else if (message.member.roles.exists("name", "✨ Patreons")) {                
                    inventoryEmbed.footer= {
                        icon_url: "https://i.imgur.com/e6GVMzo.png",
                        text: "Fandom Bank (Patron ✨)",
                    }  
            }
            //XXXXXXXX BALANCE FOR VETERANS------         
            else if (message.member.roles.exists("name", "🍙 - Veterans")) {           
                    inventoryEmbed.footer= {
                        icon_url: "https://i.imgur.com/h0UM6Nj.png",
                        text: "Fandom Bank (Veteran 🍙)",
                    } 
            }
            //XXXXXXXX BALANCE FOR MEMBERS------                   
            else if (message.member.roles.exists("name", "🍧 - Members")) {         
                    inventoryEmbed.footer= {
                        icon_url: "https://i.imgur.com/0df5BYX.png",
                        text: "Fandom Bank (Member 🍧)",
                    }
            }    
            //XXXXXXXX BALANCE FOR CUSTOMERS------                       
            else if (message.member.roles.exists("name", "☕ - Customers")) {          
                    inventoryEmbed.footer= {
                    icon_url: "https://i.imgur.com/T6XEiI2.png",
                    text: "Fandom Bank (Customer ☕)",
                    }
            }  

            var bgs = "";
            inventory[message.author.id].bgs.forEach(element => {
                if(element == exp[message.author.id].bg){
                    bgs += `**${element}**\n`
                }else{
                    bgs += `${element}\n`
                }
            });
            if(bgs.length>0) inventoryEmbed.addField("Backgrounds",bgs);
            
            var badges = ""
            inventory[message.author.id].badges.forEach(element => {
                if(exp[message.author.id].badges.includes(element)){
                    badges += `**${element}**\n`
                }else{
                    badges += `${element}\n`
                }
            });
            if(badges.length>0) inventoryEmbed.addField("Badges",badges);

            var packs = "";
            Object.keys(items).forEach(element => {
                if(items[element].role && element.includes("Pack") && message.member.roles.exists("name", items[element].role)){
                    packs += `${element.split("Pack")[0]}\n`
                }
            })
            if(packs.length>0) inventoryEmbed.addField("Embed Packs",packs);

            message.author.send(inventoryEmbed);
    }
}
