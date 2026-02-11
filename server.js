import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const CHANNEL_IDS = [
  "1470717206705868851",
  "1425189805352030300",
  "1471112158023516263"
];

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!CHANNEL_IDS.includes(msg.channel.id)) return;

  for (const id of CHANNEL_IDS) {
    if (id === msg.channel.id) continue;
    const channel = await client.channels.fetch(id);
    if (channel) {
      channel.send(`**${msg.author.username}**: ${msg.content}`);
    }
  }
});

client.login(process.env.BOT_TOKEN);
