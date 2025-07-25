const { Events } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

module.exports = {
  data: {
    name: "ping",
    description: "Replies with Pong and Latency info",
  },
  async execute(message, args) {
    const sent = await message.reply({
      content: "Pinging...",
      fetchReply: true,
    });

    const latency = sent.createdTimestamp - message.createdTimestamp;

    await sent.edit(
      `PONG!💥 \nLatency: ${latency}ms \nAPI Latency: ${Math.round(message.client.ws.ping)}ms`,
    );
  },
};
