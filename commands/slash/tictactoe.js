const { SlashCommandBuilder } = require("discord.js");
const crypto = require("crypto");

const { updateScore } = require("../../service/tictactoeGameEngineService.js");
const {
    generateTttImage,
} = require("../../service/tictactoeImageGenerationService.js");

const prisma = require("../../service/prismaClientService.js");

// functions
async function pickSymbole(player1, player2) {
    const randomNumber = Math.floor(Math.random() * 2);

    let playerX = "";
    let playerO = "";

    if (randomNumber == 0) {
        playerX = player1;
        playerO = player2;
        return { playerX, playerO };
    } else {
        playerX = player2;
        playerO = player1;
    }
    return { playerX, playerO };
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

async function isPlayerInDb(playerIdList, gameId) {
    for (let i = 0; i < playerIdList.length; i++) {
        const playerTableExist = await prisma.user.findUnique({
            where: {
                discord_id: playerIdList[i],
            },
        });

        if (playerTableExist === null) {
            const userData = await prisma.user.create({
                data: {
                    discord_id: playerIdList[i],
                    current_game: gameId,
                },
            });
        }
    }
    return;
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
    return;
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

            return { isInGame: true, player };
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
    return { IsInGame: false, undefined };
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

    return { currentPlayer, board };
}

async function callGameEngineService(board, currentPlayer, selectedMove) {
    const { newBoard, isWin, isTie, nextPlayer } = updateScore(
        board,
        currentPlayer,
        selectedMove
    );
    return { newBoard, isWin, isTie, nextPlayer };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tictactoe")
        .setDescription("Select an opponent and get to playing tic tac toe!")

        .addUserOption((option) =>
            option
                .setName("opponent")
                .setDescription("User to play against")
                .setRequired(true)
        ),

    async execute(interaction) {
        // create game data
        const gameId = crypto.randomUUID();
        const player1 = interaction.user;
        const player2 = interaction.options.getUser("opponent");
        const playerIdList = [player1.id, player2.id];
        const defaultBoard = ["", "", "", "", "", "", "", "", ""];

        // commented for debuggin and testing reasons
        // const { isInGame, playerInGame } = await isPlayerInGame(
        //     playerIdList,
        //     gameId
        // );
        // if (isInGame == true) {
        //     await interaction.reply(
        //         `Player  with user id (${playerInGame}) is alredy in a game`
        //     );
        //     return;
        // }
        //
        // if (player2.bot === true) {
        //     await interaction.reply("You can't play against a bot silly!");
        //     throw new Error("Player is already in a game");
        //     return;
        // }

        // if (player2.id === player1.id) {
        //     await interaction.reply("You can't play against yourself... Get some friends please");
        //     throw new Error("User cannot play against self");
        //     return;
        // }

        const firstPlayer = await pickFirstPlayer();
        const { playerX, playerO } = await pickSymbole(player1, player2);

        await isPlayerInDb(playerIdList, gameId);
        await initGameData(gameId, playerX, playerO, firstPlayer, defaultBoard);

        const { currentPlayer, board } = await fetchGameDataFromDb(gameId);

        // pass all current game data to game engin and write retuned board and next player into correct table in db
        const { newBoard, hasWon, isTie, nextPlayer } = await updateScore(
            board,
            currentPlayer,
            3
        );
        console.log(newBoard, hasWon, isTie, nextPlayer);

        // const gameImage = generateTttImage(prisma.tictactoe.board);
        // console.log(gameImage);

        // handle selection and display with discord componentsV2

        await interaction.reply(`Player X: ${playerX} \nPlayer O: ${playerO}`);
    },
};
