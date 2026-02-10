import express from "express";
import cors from "cors";
import { Client, GatewayIntentBits } from "discord.js";

const app = express();
app.use(cors());
app.use(express.json());

let messages = [];

const CHANNEL_IDS = [
  "1470717206705868851"
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("messageCreate", msg => {
  if (msg.author.bot) return;
  if (!CHANNEL_IDS.includes(msg.channel.id)) return;

  messages.push({
    user: msg.author.username,
    text: msg.content
  });
});

app.get("/messages", (req, res) => {
  res.json(messages);
});

app.post("/messages", async (req, res) => {
  const { user, text } = req.body;
  messages.push({ user, text });

  for (const id of CHANNEL_IDS) {
    const ch = client.channels.cache.get(id);
    if (ch) ch.send(`${user}: ${text}`);
  }

  res.sendStatus(200);
});

client.login(process.env.BOT_TOKEN);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server läuft"));
