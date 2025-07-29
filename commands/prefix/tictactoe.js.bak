const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const { generateTttImage } = require("../../service/tictactoe");
const fs = require("node:fs");

module.exports = {
  data: {
    name: "tictactoe",
    description: "",
  },
  async execute(message, args) {
    const sent = await message.reply({
      content: "Processing...",
      fetchReply: true,
    });

    const score = [
      ["x", "", "o"],
      ["o", "", "x"],
      ["x", "o", "x"]
    ]

    const imageName = await generateTttImage(score)

    const file = new AttachmentBuilder(`../temp/${imageName}.png`);
    const exampleEmbed = new EmbedBuilder()
      .setTitle('Some title')
      .setImage('attachment://tictactoe.png');

    await sent.edit(
      {embeds: [exampleEmbed], files: [file]}
    );

    await fs.rm(`../temp/${imageName}.png`, { recursive: true }, (err) => {
      console.log(err) // TODO: Replace with real logging
    });
  },
};
