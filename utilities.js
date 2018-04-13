var reactionNumbers = ["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣", "🔟"];
var reactions = ["390223211662540800","390223209930424321","390223211637243905","390223211616534577","390223211456888835","390223210240540683"];
var cooldown = {};
var colors = ["pink","d-blue","purple","l-blue","green","red"];
const Discord = require('discord.js');

var moment = require("moment");
var random = require("random-number-csprng");
var fs = require("fs");
var zipdir = require('zip-dir');
const sql = require('sqlite');

module.exports = {
	async permCheck(message, commandName, client){
		if(!message.member) message.member = await client.guilds.first().members.fetch(message.author.id)

		if(client.data.perms[commandName] == undefined || message.member.roles.exists("name","🍬 Admin") ||  message.member.roles.exists("name","🍬 Master Developer"))return true;
		var allowedChannel = true;
		var allowed = false;

		if(client.data.perms[commandName].channel.length>0){
			allowedChannel = false;
			if(client.data.perms[commandName].channel.includes(message.channel.name)) allowedChannel = true;
		}
		if(allowedChannel){
			if(client.data.perms[commandName].role.length==0 && client.data.perms[commandName].user.length==0){return true};

			if(client.data.perms[commandName].role.length>0){
				for(var i=0;i<client.data.perms[commandName].role.length;i++){
					var role = message.member.guild.roles.find("name", client.data.perms[commandName].role[i]);
					if(role != null && message.member.roles.has(role.id)){
						return true;
						i=client.data.perms[commandName].role.length;
					}
				}
			}

			if(!allowed && client.data.perms[commandName].user.length>0){
				for(var i=0;i<client.data.perms[commandName].user.length;i++){
					if(client.data.perms[commandName].user[i] == message.author.id){
						return true;
						i=client.data.perms[commandName].user.length;
					}
				}
			}

		}
		return false;
	},

	async userCheck(id,client,db){
		let member = await client.guilds.first().members.fetch(id);
		if(member.user.bot) return;

		await db.run("INSERT OR IGNORE INTO exp (id,color,rank,lvl,exp,money,lastDaily,bg) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [member.id, colors[await random(0,colors.length-1)], 0, 1, 0, 0, "Not Collected", "DEFAULT"])		
		const userInfo = await db.get(`SELECT * FROM exp WHERE id = ${member.id}`);
				
		var rankRoles = member.roles.filter(role => role.name.startsWith('['));
		if(rankRoles.size>1 || rankRoles.size == 0){
			if (rankRoles.size>1) await member.roles.remove(rankRoles);
			var role = member.guild.roles.filter(role => role.name.includes(`[${userInfo.lvl}]`));
			await member.roles.add(role,"Added level role");
		}

		if(!member.roles.exists(r => r.name.includes("Customers"))){
			let allRoles = [client.data.colorRoles[userInfo.color][userInfo.rank].id, client.data.groupRoles[userInfo.color].id];
			let roles = allRoles.filter(id => !member.roles.has(id))
			await member.roles.add(roles,"User join");
		}
	},

	react:function(msg){
		reactions.forEach(reaction => {
			msg.react(reaction);
		})
	},

	/*findEmoji:function(emoji){
        for(var i=0;i<10;i++){
            if(reactions[i]==emoji){
                return i+1;
            }
        }
    },*/

	async exp(msg,client,db){
		if(cooldown[msg.author.id] == undefined && !msg.author.bot && msg.member){ //checks if the user is not on cooldown and filters bots out
			await module.exports.userCheck(msg.author.id,client,db)

			var userInfo = await db.get(`SELECT id,lvl,rank,money,exp FROM exp WHERE id = ${msg.author.id}`);

			//adds random amount (15-25) of exp to the user
			var randomExp = Math.floor(Math.random() * ((25-15)+1) + 15);
			userInfo.exp += randomExp;
			await db.run(`UPDATE exp SET exp = ${userInfo.exp} WHERE id = ${msg.author.id}`);

			if(userInfo.exp > client.data.levels[userInfo.lvl-1].exp){ //checks if the user has reached enough exp
				var levelroles = msg.member.roles.filter(r=>r.name.includes("[")) //finds all roles that start with [
				await msg.member.roles.remove(levelroles,"Removed level roles"); //removes all lvl roles
				
				userInfo.lvl += 1;
				await db.run(`UPDATE exp SET lvl = ${userInfo.lvl} WHERE id = ${msg.author.id}`);

				await msg.member.roles.add([msg.guild.roles.find("name",`[${userInfo.lvl}]`)]);

				userInfo.money += 2000
				await db.run(`UPDATE exp SET money = ${userInfo.money} WHERE id = ${msg.author.id}`);

				if(client.data.levels[userInfo.lvl].rewards != undefined){
					client.data.levels[userInfo.lvl].rewards.forEach(async reward => { //checks every reward
						switch(reward.type){
							case "role":
								/*{
									"type": "role",
									"name": "🍧 - Members",
									"remove":"☕ - Customers"
								}*/
								if(!(msg.member.nickname.endsWith("🔰") || msg.member.nickname.endsWith("🍬") || msg.member.nickname.endsWith("🔧") || msg.member.nickname.endsWith("✨") || msg.member.nickname.endsWith("🔖"))){
									await msg.member.roles.add(msg.guild.roles.find("name",reward.name),"Added reward role"); //adds the rewarded role
									await msg.member.roles.remove(msg.guild.roles.find("name",reward.remove),"Removed old rank")

									var nick = msg.member.nickname;
									if(msg.member.nickname.endsWith(reward.remove.split(" ")[0])){
										nick = nick.split(reward.remove.split(" ")[0])[0]
									}
									nick += reward.name.split(" ")[0]

									await msg.member.setNickname(nick,"Changed nickname emoji");
								}
								break;

							case "rankUP":
								/*{
									"type": "rankUP"
								}*/								

								let rank = userInfo.rank;
								let color = userInfo.color;
								let oldRoles = [client.data.colorRoles[color][rank]];
								let newRoles = [client.data.colorRoles[color][rank + 1]];

								await msg.member.roles.remove(oldRoles);
								await msg.member.roles.add(newRoles);

								if(!(msg.member.nickname.endsWith("🔰") || msg.member.nickname.endsWith("🍬") || msg.member.nickname.endsWith("🔧") || msg.member.nickname.endsWith("✨") || msg.member.nickname.endsWith("🧣") || msg.member.nickname.endsWith("🎬") || msg.member.nickname.endsWith("💎"))){
									var nick = msg.member.nickname.split(' ');
									nick[nick.length - 1] = newRoles[0].name.split(' ')[0];
									msg.member.setNickname(nick.join(' '), 'Changed nickname emoji');
								}

								await db.run(`UPDATE exp SET rank = ${userInfo.rank + 1} WHERE id = ${msg.author.id}`);
								break;
						}
					})
				}

			}

			cooldown[msg.author.id] = true; //sets the user on cooldown and will remove it in 60000 ms (1 minute)
			setTimeout(function(authorID){
				delete cooldown[authorID];
			},90000,msg.author.id)
		}
	},

	talk:function(client,msg){
		if(msg.mentions.channels.size>0){
			client.channels.resolve(msg.mentions.channels.first()).send(msg.content.split(msg.mentions.channels.first()).join(""));
		}
	},

	async swapPFP(client){		  
		let day = moment().date();
		let month = moment().month() + 1;

		zipdir('../data', { saveTo: `./data/${day}.${month}.zip` }, async(err, buffer) => {
			if(err)
				module.exports.log(client, `Failed backup: ${err}`)
			else
				module.exports.log(client, `${day}.${month}.zip created`)
		});

		client.guilds.first().setIcon(`./images/serverpics/${day}.${month}.png`)
		.then(updated => {
			client.data.info.lastPFP = moment().format('YYYY-MM-DD');
			module.exports.save(client.data.info, 'info');

			var nextDay = moment().add(1, 'day').format('YYYY-MM-DD');
			setTimeout(module.exports.swapPFP, moment(nextDay).diff(moment()))
			module.exports.log(client, `Next profile pic change and backup scheduled to happen ${moment().to(nextDay)}`)
		})
	},

	async save(data,name){
		await fs.writeFile("data/" + name + ".json", JSON.stringify(data, null, 4));
	},


	log:function(client,log){
		console.log(log);
		if(client != null && client.channels.size>0 && client.readyAt != null){			
			client.channels.find("name","bot-logs").send({embed:new Discord.MessageEmbed().setTimestamp().setDescription(log)});
		}
	}
}

