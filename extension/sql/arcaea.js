const Discord = require('discord.js');
module.exports = {
  name: 'arcaea', // Command's name(Require)
  description: 'Arcaea難度速查/抽歌', // What can this command do(Require)
  args: true, // If need args set true
  usage: '<難度> <級別/random> (<定數下限>) ([定數上限])', // If need to send usage on execute failed set it
  guildOnly: false, // If command guild only set true
  aliases: ['arc'], // If command has aliases set it
  needSQL: true, // If command need SQL set to true
  async execute(msg, args, prefix, command, connection) {
    const nodata = new Discord.MessageEmbed()
      .setColor('RANDOM') // Embed邊條顏色 可使用清單參考 https://discord.js.org/#/docs/main/stable/typedef/ColorResolvable
      .setTitle('查無資料') // Embed標題(第二行)
      .setAuthor('GamerAyano', 'https://cdn.discordapp.com/avatars/854226113643151360/7d25f7032b550e9dcc137d4250ce1bbb.png') // Embed作者資訊(第一行[顯示文字][頭貼][連結])
      .setDescription(`該難度無等級${args[1]}的歌曲}`) // Embed說明(第三行)
      .setThumbnail('https://i.imgur.com/Ey4IVVr.jpg') // Embed右邊小圖示
      .setTimestamp() // 時間戳記(跟Footer同行 會跟在Footer後)
      .setFooter('Copyright © 結城あやの From SJ Bots', 'https://cdn.discordapp.com/avatars/854226113643151360/7d25f7032b550e9dcc137d4250ce1bbb.png'); // Embed頁尾([文字][頭貼])
    const randomfailed = new Discord.MessageEmbed()
      .setColor('RANDOM') // Embed邊條顏色 可使用清單參考 https://discord.js.org/#/docs/main/stable/typedef/ColorResolvable
      .setTitle('隨機失敗') // Embed標題(第二行)
      .setAuthor('GamerAyano', 'https://cdn.discordapp.com/avatars/854226113643151360/7d25f7032b550e9dcc137d4250ce1bbb.png') // Embed作者資訊(第一行[顯示文字][頭貼][連結])
      .setDescription(`該難度無${args[2]}到${args[3]}的曲子`) // Embed說明(第三行)
      .setThumbnail('https://i.imgur.com/Ey4IVVr.jpg') // Embed右邊小圖示
      .setTimestamp() // 時間戳記(跟Footer同行 會跟在Footer後)
      .setFooter('Copyright © 結城あやの From SJ Bots', 'https://cdn.discordapp.com/avatars/854226113643151360/7d25f7032b550e9dcc137d4250ce1bbb.png'); // Embed頁尾([文字][頭貼])
    if (
      (`${args[0]}` === 'past' ||
        `${args[0]}` === 'pst' ||
        `${args[0]}` === 'present' ||
        `${args[0]}` === 'prs' ||
        `${args[0]}` === 'future' ||
        `${args[0]}` === 'ftr' ||
        `${args[0]}` === 'beyond' ||
        `${args[0]}` === 'byd') &&
      `${args[2]}`
    ) {
      if (`${args[0]}` === 'pst') {
        args[0] = 'past';
      }
      if (`${args[0]}` === 'prs') {
        args[0] = 'present';
      }
      if (`${args[0]}` === 'ftr') {
        args[0] = 'future';
      }
      if (`${args[0]}` === 'byd') {
        args[0] = 'beyond';
      }
      if (`${args[1]}` === 'random') {
        await connection.query(
          `SELECT name, pack, difficulty, realdiff, side, picture FROM rhythmgamedata.arcaea_${args[0]} WHERE realdiff >= ${parseFloat(args[2])} AND realdiff <= ${parseFloat(args[3])};`,
          (err, rows) => {
            if (err) throw err;
            else if (rows.length < 1) msg.channel.send(randomfailed);
            else {
              var num = Math.floor(Math.random() * rows.length);
              if (rows[num].side === '光') {
                let side = '#87CEFA';
              } else {
                side = '#4B0082';
              }
              const randomsong = new Discord.MessageEmbed()
                .setColor(`${side}`)
                .setTitle('這是我為你選出來的曲子')
                .setAuthor('GamerAyano', 'https://cdn.discordapp.com/avatars/854226113643151360/7d25f7032b550e9dcc137d4250ce1bbb.png')
                .setDescription('好好享受吧')
                .setThumbnail(rows[num].picture)
                .addFields(
                  {
                    name: '曲名',
                    value: rows[num].name,
                  },
                  {
                    name: '曲包',
                    value: rows[num].pack,
                  },
                  {
                    name: '難度',
                    value: rows[num].difficulty,
                  },
                  {
                    name: '譜面定數',
                    value: rows[num].realdiff,
                  }
                )
                .setFooter('Copyright © 結城あやの From SJ Bots', 'https://cdn.discordapp.com/avatars/854226113643151360/7d25f7032b550e9dcc137d4250ce1bbb.png');
              msg.channel.send(randomsong);
            }
          }
        );
      } else {
        const list = [];
        const level = args[1].replace('+', '.7');
        await connection.query(`SELECT name, pack, side FROM rhythmgamedata.arcaea_${args[0]} WHERE difficulty = ${parseFloat(level)} ORDER BY realdiff, name;`, (err, rows) => {
          if (err) throw err;
          else if (rows.length < 1) msg.channel.send(nodata);
          else {
            msg.channel.send(`以下為${args[0]}等級${args[1]}的曲子\n共有**${rows.length}**首：\n`);
            let end = rows.length;
            for (var counter = 0; counter < end; counter++) {
              let songs = rows[counter].pack + ': ' + rows[counter].name + '(' + rows[counter].side + ')';
              list.push(songs);
            }
            msg.channel.send(list);
          }
        });
      }
    } else await msg.channel.send(`這條指令的用法應該要像這樣: \`${prefix}${command.name} ${command.usage}\``);
  },
};
