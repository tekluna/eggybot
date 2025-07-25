const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong and Latency info"),

  async execute(interaction) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;

    // Use editReply instead of reply again
    await interaction.editReply(
      `PONG!💥 \nLatency: ${latency}ms \nAPI Latency: ${Math.round(interaction.client.ws.ping)}ms`,
    );
  },
};
