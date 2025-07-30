const { SlashCommandBuilder } = require("discord.js");
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const { updateScore } = require("../../service/tictactoeGameEngineService.js");

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
        const prisma = new PrismaClient();

        const gameId = crypto.randomUUID();
        const player1 = interaction.user;
        const player2 = interaction.options.getUser("opponent");
        const board = ["", "", "", "", "", "", "", "", ""];

        if (player2.bot === true) {
            await interaction.reply("You can't play against a bot silly!");
            return;
        }
        function pickSymbole(player1, player2) {
            const randomNumber = Math.floor(Math.random() * 2);

            if (randomNumber == 0) {
                const playerX = player1;
                const playerO = player2;
                return { playerX, playerO };
            } else {
                const playerX = player2;
                const playerO = player1;
                return { playerX, playerO };
            }
            return;
        }

        function pickFirstPlayer() {
            let firstPlayer = "";

            const randomNumber = Math.floor(Math.random() * 2);
            if (randomNumber == 0) {
                firstPlayer = "x";
            } else {
                firstPlayer = "o";
            }
            return firstPlayer;
        }
        const { playerX, playerO } = pickSymbole(player1, player2);
        const firstPlayer = pickFirstPlayer();

        const playerOneTableExist = await prisma.user.findUnique({
            where: {
                discord_id: player1.id,
            },
        });
        if (playerOneTableExist === null) {
            const userData = await prisma.user.create({
                data: {
                    discord_id: player1.id,
                },
            });
        }

        const playerTwoTableExist = await prisma.user.findUnique({
            where: {
                discord_id: player2.id,
            },
        });
        if (playerTwoTableExist === null) {
            const userData = await prisma.user.create({
                data: {
                    discord_id: player2.id,
                },
            });
        }
        const gameData = await prisma.tictactoe.create({
            data: {
                gameId: gameId,
                playerX: playerX.id,
                playerO: playerO.id,
                currentPlayer: firstPlayer,
                board: JSON.stringify(board),
            },
        });

        await interaction.reply(`Player X: ${playerX} \nPlayer O: ${playerO}`);
    },
};
