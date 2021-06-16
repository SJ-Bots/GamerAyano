const Discord = require('discord.js');
const client = new Discord.Client();
const mysql = require('mysql');
const fs = require('fs');

require('dotenv').config();
const token = process.env.token;
const prefix = process.env.prefix;
const address = process.env.address;
const account = process.env.account;
const password = process.env.password;
const database = process.env.database;

client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync('./extension');
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./extension/${folder}`).filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./extension/${folder}/${file}`);
    client.commands.set(command.name, command);
  }
}

const testdb = mysql.createConnection({
  host: address,
  user: account,
  password: password,
  database: database,
});
testdb.connect((err) => {
  if (err) throw err;
  console.log('正在測試資料庫連線...\n資料庫已成功連線!');
  testdb.end();
  console.log('測試完畢!\n已將資料庫斷線');
});

client.on('ready', () => {
  client.user.setPresence({
    activity: {
      name: `Powered by 結城あやの | Using ${prefix}help`,
      type: 'LISTENING',
    },
    status: 'idle',
  });
  console.log(`已登入使用者：${client.user.tag}!\n作者：結城あやの`);
});

client.on('message', async (msg) => {
  const args = msg.content.slice(prefix.length).trim().toLowerCase().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (msg.author.bot) return;
  else if (!msg.content.startsWith(prefix)) return;
  else if (!command) return msg.reply(`沒有這條指令\n**${msg.content}**`);
  else {
    if (command.guildOnly && msg.channel.type === 'dm') {
      return msg.reply('這條指令無法在DM執行!\n**${message.content}**');
    }

    if (command.permissions) {
      const authorPerms = msg.channel.permissionsFor(msg.author);
      if (!authorPerms || !authorPerms.has(command.permissions)) {
        return msg.reply(`您**無法**這麼做\n原因：缺少權限 **${command.permissions}**`);
      }
    }

    if (command.args && !args.length) {
      let reply = `您未提供任何參數!`;

      if (command.usage) {
        reply += `\這條指令的用法應該要像這樣： \`${prefix}${command.name} ${command.usage}\``;
      }

      return msg.reply(reply);
    }
    if (command.needSQL) {
      try {
        const connection = mysql.createConnection({
          host: address,
          user: account,
          password: password,
          database: database,
        });
        connection.connect(async (err) => {
          if (err) throw err;
          console.log('資料庫已成功連線!');
          await command.execute(msg, args, prefix, command, connection);
          connection.end();
          console.log('查詢完畢！\n已將資料庫斷線');
        });
      } catch (error) {
        msg.channel.send(`<@${author}>Bot炸啦\n<@${master}>Bot炸啦\n\`\`\`${error}\`\`\``);
      }
    } else {
      try {
        command.execute(msg, args, prefix, command);
      } catch (error) {
        msg.channel.send(`<@${author}>Bot炸啦\n<@${master}>Bot炸啦\n\`\`\`${error}\`\`\``);
      }
    }
  }
});

client.login(token);
