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

// Deine Channel-IDs
const CHANNEL_IDS = ["1470717206705868851", "1425189805352030300", "1471112158023516263"];
let messageHistory = []; 

// Discord Nachrichten abfangen
client.on("messageCreate", async (msg) => {
  // Ignoriere Bots und Nachrichten aus anderen Channels
  if (msg.author.bot || !CHANNEL_IDS.includes(msg.channel.id)) return;

  // Speichere Nachricht intern (u = username, t = text)
  messageHistory.push({ u: msg.author.username, t: msg.content });
  
  // Behalte nur die letzten 15 Nachrichten, damit der 3DS-Bildschirm nicht überläuft
  if (messageHistory.length > 15) messageHistory.shift();

  // Cross-Platform Messaging: Sende Nachricht an die anderen Discord-Channels
  for (const id of CHANNEL_IDS) {
    if (id === msg.channel.id) continue;
    try {
      const channel = await client.channels.fetch(id);
      if (channel) await channel.send(`**${msg.author.username}**: ${msg.content}`);
    } catch (e) { console.error("Discord Send Error:", e); }
  }
});

// --- ENDPUNKTE FÜR DEN 3DS ---

// GET /3ds: Liefert reinen Text an die Konsole
app.get("/3ds", (req, res) => {
  if (messageHistory.length === 0) {
    return res.send("Noch keine Nachrichten...");
  }

  // Wandelt das Array in einen String um: "User: Nachricht\nUser: Nachricht..."
  const flatText = messageHistory
    .map(msg => `${msg.u}: ${msg.t}`)
    .join("\n");
  
  // Sende als "text/plain", das kann der 3DS am einfachsten verarbeiten
  res.setHeader('Content-Type', 'text/plain');
  res.send(flatText);
});

// POST /send: Empfängt Nachrichten vom 3DS
app.post("/send", async (req, res) => {
  const { username, text } = req.body;
  
  if (!text || !username) return res.sendStatus(400);

  // Nachricht in die lokale Historie aufnehmen
  messageHistory.push({ u: username, t: text });
  if (messageHistory.length > 15) messageHistory.shift();

  // Nachricht an alle Discord-Channels senden
  for (const id of CHANNEL_IDS) {
    try {
      const channel = await client.channels.fetch(id);
      if (channel) await channel.send(`**[MiiCord] ${username}**: ${text}`);
    } catch (e) { console.error("Discord Relay Error:", e); }
  }
  
  res.sendStatus(200);
});

// Server Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MiiCord Server läuft auf Port ${PORT}`);
});

client.login(process.env.BOT_TOKEN);
