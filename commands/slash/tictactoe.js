const { SlashCommandBuilder } = require("discord.js");
const {updateScore} = require("../../service/tictactoeGameEngineService.js");

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
        const board = ["", "", "", "", "", "", "", "", ""];
        const player1 = interaction.user
        const player2 = interaction.options.getUser("opponent");
        const gameId = crypto.randomUUID()

        function pickSymbole(player1, player2){

            const randomNumber = Math.floor(Math.random() * 2);;

            if (randomNumber == 0){
                const playerX = player1;
                const playerO = player2;
                return {playerX, playerO};
            } else {
                const playerX = player2;
                const playerO = player1;
                return {playerX, playerO};
            }
            return;
        } 
        const {playerX, playerO} = pickSymbole(player1, player2)
        console.log(playerX,playerO);

        await interaction.reply(
            `Player X: ${playerX} \nPlayer O: ${playerO}`
        );
    },
};
