import { Client, GatewayIntentBits } from "discord.js";
import express from "express";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const app = express();
app.use(express.json());

const CHANNEL_IDS = [
  "1470717206705868851",
  "1425189805352030300",
  "1471112158023516263"
];

let messageHistory = []; 
let lastSeenUsers = new Map(); 

client.on("messageCreate", async (msg) => {
  if (msg.author.bot || !CHANNEL_IDS.includes(msg.channel.id)) return;

  messageHistory.push({ u: msg.author.username, t: msg.content });
  if (messageHistory.length > 20) messageHistory.shift();

  // Discord-zu-Discord Spiegelung
  for (const id of CHANNEL_IDS) {
    if (id === msg.channel.id) continue;
    try {
      const channel = await client.channels.fetch(id);
      if (channel) await channel.send(`**${msg.author.username}**: ${msg.content}`);
    } catch (e) { console.error("Discord Error", e); }
  }
});

app.get("/3ds", (req, res) => {
  lastSeenUsers.set(req.ip, Date.now());
  for (let [ip, time] of lastSeenUsers) {
    if (Date.now() - time > 30000) lastSeenUsers.delete(ip);
  }
  res.json({ online: lastSeenUsers.size, messages: messageHistory });
});

app.post("/send", async (req, res) => {
  const { username, text } = req.body;
  if (!text) return res.sendStatus(400);
  for (const id of CHANNEL_IDS) {
    try {
      const channel = await client.channels.fetch(id);
      if (channel) await channel.send(`**[MiiCord] ${username}**: ${text}`);
    } catch (e) { console.error(e); }
  }
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => console.log("MiiCord Server läuft auf Railway"));
client.login(process.env.BOT_TOKEN);