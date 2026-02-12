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

  // Wir extrahieren alle Anhänge (Bilder, Dateien) aus der Nachricht
  const files = msg.attachments.map(attachment => attachment.url);

  for (const id of CHANNEL_IDS) {
    if (id === msg.channel.id) continue;
    
    try {
      const channel = await client.channels.fetch(id);
      if (channel) {
        // Wir senden den Text UND das Array mit den Dateien
        await channel.send({
          content: `**${msg.author.username}**: ${msg.content}`,
          files: files // Hier werden die Bilder mitgeschickt
        });
      }
    } catch (error) {
      console.error(`Fehler beim Senden an Kanal ${id}:`, error);
    }
  }
});

client.login(process.env.BOT_TOKEN);
