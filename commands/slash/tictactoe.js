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

async function initGameData(
  gameId,
  playerX,
  playerO,
  firstPlayer,
  defaultBoard
) {
  const jsonBoard = JSON.stringify(defaultBoard);

  const gameData = await prisma.tictactoe.create({
    data: {
      gameId: gameId,
      playerX: playerX.id,
      playerO: playerO.id,
      currentPlayer: firstPlayer,
      board: jsonBoard,
    },
  });
}

async function isPlayerInGame(playerIdList, gameId) {
  for (let i = 0; i < playerIdList.length; i++) {
    player = playerIdList[i];
    const userData = await prisma.user.findUnique({
      where: {
        discord_id: playerIdList[i],
      },
    });

    if (userData.current_game !== null) {

      return {isInGame: true, player};
    } else {
      if (!userData.current_game) {
        await prisma.user.update({
          where: {
            discord_id: playerIdList[i],
          },
          data: {
            current_game: gameId,
          },
        });
      }
    }
  }
  return {IsInGame: false, undefined};
  // if user has a currentgame get the id to fetchGameDataFromDb
}

async function fetchGameDataFromDb(gameId) {
  const gameData = await prisma.tictactoe.findUnique({
    where: {
      gameId: gameId,
    },
  });
  const currentPlayer = gameData.currentPlayer;
  const board = JSON.parse(gameData.board);

  if (!Array.isArray(board) || board.length !== 9) {
    throw new Error("Invalid board data");
  }

  return {currentPlayer, board};
}

async function callGameEngineService(board, currentPlayer, selectedMove) {
  const {newBoard, isWin, isTie, nextPlayer} = updateScore(
    board,
    currentPlayer,
    selectedMove
  );
  return {newBoard, isWin, isTie, nextPlayer};
}

async function createTttGame(playerX, playerO){
  const board = ["", "", "", "", "", "", "", "", ""]
  const jsonBoard = JSON.stringify(board);
  const gameId = await crypto.randomUUID();
  const firstPlayer = await pickFirstPlayer();

  await prisma.tictactoe.create({
    data: {
      gameId: gameId,
      playerX: playerX.id,
      playerO: playerO.id,
      currentPlayer: firstPlayer,
      board: jsonBoard,
    },
  });
  return {gameId, board}
}


module.exports = {
  data: new SlashCommandBuilder()
    .setName("tictactoe")
    .setDescription("Select an opponent and get to playing tic tac toe!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("start")
        .setDescription("Create new tic tac toe game!")
        .addUserOption((option) =>
          option
            .setName("opponent")
            .setDescription("User to play against")
        )
    )
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
    console.log(interaction.options)
    console.log(interaction.options._subcommand)
    console.log(interaction.options)


    let board = null
    const player1 = interaction.user;
    if (interaction.options._subcommand === "start") {
      const player2 = interaction.options.getUser("opponent");
      const playerIdList = [player1.id, player2.id];
      const playerDbList = [];
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
            throw new Error(`TicTacToe is not working: ${typeof e}: ${e}`);
          }
        }
      }
      // playerDbList[0].current_game === playerDbList[1].current_game
      if (!playerDbList[0].current_game && !playerDbList[1].current_game) {
        const res = await createTttGame(playerX, playerO);
        console.log(res)
        gameId = res.gameId;
        board = res.board;
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
          throw new Error(`${player1.tag} is already in a game`);
        }
        if (playerDbList[1].current_game) {
          throw new Error(`${player2.tag} is already in a game`);
        }
      }
    }

    // for (const discord_id of playerIdList) {
    //   try{
    //     const newUser = await prisma.tictactoe.findUniqueOrThrow({
    //       where: {
    //         discord_id
    //       },
    //     })
    //     playerDbList.push(newUser);
    //     gameId = await createTttGame(playerX, playerO);
    //
    //   } catch (e) {
    //     if (e instanceof PrismaClientKnownRequestError) {
    //       const newUser = await prisma.user.create({
    //         data: {
    //           discord_id
    //         },
    //       });
    //       playerDbList.push(newUser);
    //     }
    //   }
    // }


    // const {currentPlayer, board} = await fetchGameDataFromDb(gameId);

    // pass all current game data to game engin and write retuned board and next player into correct table in db
    // const {newBoard, hasWon, isTie, nextPlayer} = await updateScore(
    //   board,
    //   currentPlayer,
    //   3
    // );

    // const res = await prisma.tictactoe.update({
    //   where: {
    //     gameId: gameId,
    //   },
    //   data: {
    //     board: JSON.stringify(newBoard),
    //   },
    // });

    const boardImageFileName = await generateTttImage(board);
    const file = new AttachmentBuilder(`${__dirname}/../../temp/${boardImageFileName}.png`);
    const embedMessage = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('TIC-TAC-TOE')
      .setDescription('The game right now :')
      .setImage(`attachment://${boardImageFileName}.png`)

    await interaction.reply({ embeds: [embedMessage], files: [file] });
    deleteTttImage(boardImageFileName)
  },
};
