var path = require("path");
const git = require('simple-git')(path.resolve(__dirname,"../"));
var util = require('../../utilities.js');

module.exports = {
    desc:"This is a description",
    async execute(client, message, param){
        await message.delete();
        message.channel.send("Downloading changes.....").then(async m=>{
            git.pull(async (err,res)=>{               
                if(err){
                    util.log(client,err);
                    return m.edit("Git pull failed!")
                }
                console.log(res);
                if(res.files.length>0){
                    await m.edit(`Git pull successful!\nModified files: ${res.files.join(" ,")}\nSummary: ${JSON.stringify(res.summary).split("{")[1].split("}")[0]}`);
                    process.exit();
                }else{
                    m.edit("Already up to date!");
                }
            })
        })      
}
}
