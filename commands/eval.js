module.exports = {
    desc:"Runs the written code (Use with precaution). >eval <code>",
    execute(client, message, param){
            /*var exp = json.readFileSync("../data/exp.json");
            var inventory = json.readFileSync("../data/inventory.json");*/
            param = param.slice(1)
            const code = param.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);

            if (typeof(evaled) === "string")
                evaled = evaled.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));

            message.channel.send(evaled, {code:"xl",split:true});
    }
}
