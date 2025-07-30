const { SlashCommandBuilder } = require("discord.js");
const crypto = require("crypto");

const { updateScore } = require("../../service/tictactoeGameEngineService.js");
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

async function isPlayerInDb(playerIdList) {
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
                },
            });
        }
    }
    return;
}

async function writeGameData(gameId, playerX, playerO,firstPlayer,defaultBoard) {
    const gameData = await prisma.tictactoe.create({
        data: {
            gameId: gameId,
            playerX: playerX.id,
            playerO: playerO.id,
            currentPlayer: firstPlayer,
            board: JSON.stringify(defaultBoard),
        },
    });
    return;
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

        if (player2.bot === true) {
            await interaction.reply("You can't play against a bot silly!");
            return;
        }

        const firstPlayer = await pickFirstPlayer();
        const { playerX, playerO } = await pickSymbole(player1, player2);

        await isPlayerInDb(playerIdList);
        await writeGameData(gameId, playerX, playerO, firstPlayer, defaultBoard);

        await interaction.reply(`Player X: ${playerX} \nPlayer O: ${playerO}`);
    },
};
