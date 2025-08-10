const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const crypto = require("crypto");
const { updateScore } = require("../../service/tictactoeGameEngineService.js");
const { generateTttImage } = require("../../service/tictactoeImageGenerationService.js");
const fs = require("fs");
const {deleteTttImage} = require("../../service/tictactoeImageGenerationService");
const { PrismaClient, Prisma } = require("@prisma/client");

const prisma =  new PrismaClient();

async function pickSymbole(player1, player2) {
  const randomNumber = Math.floor(Math.random() * 2);
  let playerX =  randomNumber ? player1 : player2;
  let playerO = randomNumber ? player2 : player1;
  return {playerX, playerO};
}

async function pickFirstPlayer() {
  let firstPlayer = "";

  const randomNumber = Math.floor(Math.random() * 2);
  if (randomNumber == 0) {
    firstPlayer = "x";
  } else {
    firstPlayer = "o";
  }
  return firstPlayer;
}

const sendEmbedMessage = async (interaction, nextTurnPlayer, board, winner=false, isTie=false) => {
  const boardImageFileName = await generateTttImage(board);
  const file = new AttachmentBuilder(`${__dirname}/../../temp/${boardImageFileName}.png`);
  const message = winner ? `${winner} won !` : isTie ? "It's a tie !" : `It's ${nextTurnPlayer}'s turn !`
  // const message = isTie ? "It's a tie" : winner ? `${winner} won` : `It's your turn ${nextTurnPlayer} !`
  const embedMessage = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('TIC-TAC-TOE')
    .setDescription(message)
    .setImage(`attachment://${boardImageFileName}.png`)

  await interaction.reply({ embeds: [embedMessage], files: [file] });
  deleteTttImage(boardImageFileName)
}

const sendEmbedStartingMessage = async (interaction, nextTurnPlayer, board) => {
  const boardImageFileName = await generateTttImage(board);
  const file = new AttachmentBuilder(`${__dirname}/../../temp/${boardImageFileName}.png`);
  const embedMessage = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('TIC-TAC-TOE')
    .setDescription(`
      ᲼These are the playable positions :
       \u200B
      ᲼1᲼|᲼2᲼|᲼3
      ᲼4᲼|᲼5᲼|᲼6
      ᲼7᲼|᲼8᲼|᲼9
    `)
    .setImage(`attachment://${boardImageFileName}.png`)

  await interaction.reply({ embeds: [embedMessage], files: [file] });
  deleteTttImage(boardImageFileName)
}

const sendEmbedErrorMessage = async (interaction, errorMessage) => {
  const embedMessage = new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle('TIC-TAC-TOE')
    .setDescription(errorMessage)
  await interaction.reply({ embeds: [embedMessage] });
}

async function createTttGame(playerX, playerO){
  const board = ["", "", "", "", "", "", "", "", ""]
  const jsonBoard = JSON.stringify(board);
  const gameId = await crypto.randomUUID();
  const firstPlayer = await pickFirstPlayer();
  const firstPlayerDiscordUser = firstPlayer === "x" ? playerX : playerO

  await prisma.tictactoe.create({
    data: {
      gameId: gameId,
      playerX: playerX.id,
      playerO: playerO.id,
      currentPlayer: firstPlayer,
      board: jsonBoard,
    },
  });
  return {gameId, board, firstPlayerDiscordUser}
}


module.exports = {
  data: new SlashCommandBuilder()
    .setName("tictactoe")
    .setDescription("Select an opponent and get to playing tic tac toe!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("start")
        .setDescription("Create a new tic-tac-toe game !")
        .addUserOption((option) =>
          option
            .setName("opponent")
            .setDescription("User to play against")
        )
    )
    // .addSubcommand((subcommand) =>
    //   subcommand
    //     .setName("join")
    //     .setDescription("Join a tic tac toe game !")
    //     .addUserOption((option) =>
    //     option
    //     )
    // )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("play")
        .setDescription("Play a move")
        .addNumberOption((option) =>
          option
            .setName("position")
            .setDescription("Choose a position")
            .setMinValue(1)
            .setMaxValue(9)
        )
    ),

  async execute(interaction) {
    let board = null
    let nextTurnPlayer = null
    const player1 = interaction.user;
    const playerDbList = [];

    if (interaction.options._subcommand === "start") {
      const player2 = interaction.options.getUser("opponent");
      const playerIdList = [player1.id, player2.id];
      const {playerX, playerO} = await pickSymbole(player1, player2);
      let gameId = ""

      for (const discord_id of playerIdList) {
        try{
          const newUser = await prisma.user.findUniqueOrThrow({
            where: {
              discord_id
            },
          })
          playerDbList.push(newUser);
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError) {
            const newUser = await prisma.user.create({
              data: {
                discord_id
              },
            });
            playerDbList.push(newUser);
          } else {
            return await sendEmbedErrorMessage(interaction, "Tic-Tac-Toe is not working !")
          }
        }
      }
      if (!playerDbList[0].current_game && !playerDbList[1].current_game) {
        const res = await createTttGame(playerX, playerO);
        gameId = res.gameId;
        board = res.board;
        nextTurnPlayer = res.firstPlayerDiscordUser
        for (const playerDb of playerDbList) {
          await prisma.user.update({
            where: {
              discord_id: playerDb.discord_id,
            },
            data: {
              current_game: gameId,
            },
          })
        }
      } else {
        if (playerDbList[0].current_game) {
          return await sendEmbedErrorMessage(interaction, `${player1} is already in a game`)
        }
        if (playerDbList[1].current_game) {
          return await sendEmbedErrorMessage(interaction, `${player1} is already in a game`)
        }
      }
      return await sendEmbedStartingMessage(interaction, nextTurnPlayer, board)
    }
    if (interaction.options._subcommand === "play") {
      try {
        const playerDb1 = await prisma.user.findUniqueOrThrow({
          where: { discord_id: player1.id },
        });
        playerDbList.push(playerDb1);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          return await sendEmbedErrorMessage(interaction, "You didn't start a game already !")
        }
      }
      if (!playerDbList[0].current_game) {
        return await sendEmbedErrorMessage(interaction, "You didn't start a game already !")
      }
      try {
        const tttGame = await prisma.tictactoe.findUniqueOrThrow({
          where: {
            gameId: playerDbList[0].current_game,
          }
        });
        const player = tttGame.playerX === playerDbList[0].discord_id ? "x" : "o"
        nextTurnPlayer = `<@${player === "x" ? tttGame.playerO : tttGame.playerX}>`
        board = JSON.parse(tttGame.board)
        if (tttGame.currentPlayer === player) {
          const res = updateScore(board, player, interaction.options._hoistedOptions[0].value);
          board = res.newBoard;
          await prisma.tictactoe.update({
            where: { gameId: tttGame.gameId },
            data: {
              currentPlayer: res.nextPlayer,
              board: JSON.stringify(board),
            }
          })
          if (res.hasWon || res.isTie) {
            if (res.hasWon) {
              playerDbList[0].tttWins++
              await prisma.user.update({
                where: { discord_id: playerDbList[0].discord_id },
                data: { tttWins: playerDbList[0].tttWins },
              })
            }
            const winner = res.hasWon ? player1 : false
            await sendEmbedMessage(interaction, nextTurnPlayer, board, winner, res.isTie);
            await prisma.user.updateMany({
              where: { current_game: tttGame.gameId },
              data: { current_game: null },
            })
            await prisma.tictactoe.delete({
              where: { gameId: tttGame.gameId },
            })
            return
          }
        }
      } catch (e) {
        return await sendEmbedErrorMessage(interaction, e.message);
      }
    }
    await sendEmbedMessage(interaction, nextTurnPlayer, board)
  },
};
