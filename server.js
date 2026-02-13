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

const CHANNEL_IDS = ["1470717206705868851", "1425189805352030300", "1471112158023516263"];
let messageHistory = []; 

client.on("messageCreate", async (msg) => {
  if (msg.author.bot || !CHANNEL_IDS.includes(msg.channel.id)) return;

  messageHistory.push({ u: msg.author.username, t: msg.content });
  if (messageHistory.length > 20) messageHistory.shift();

  for (const id of CHANNEL_IDS) {
    if (id === msg.channel.id) continue;
    try {
      const channel = await client.channels.fetch(id);
      if (channel) await channel.send(`**${msg.author.username}**: ${msg.content}`);
    } catch (e) { console.error(e); }
  }
});

// Endpunkte für den 3DS
app.get("/3ds", (req, res) => res.json({ messages: messageHistory }));

app.post("/send", async (req, res) => {
  const { username, text } = req.body;
  if (!text) return res.sendStatus(400);
  for (const id of CHANNEL_IDS) {
    const channel = await client.channels.fetch(id);
    if (channel) await channel.send(`**[MiiCord] ${username}**: ${text}`);
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`MiiCord läuft auf Port ${PORT}`));
client.login(process.env.BOT_TOKEN);
