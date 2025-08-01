const { updateScore } = require("../service/tictactoeGameEngineService.js");

const player = "o";
const board = ["x", "x", "o", "", "", "o", "", "", "x"];
const selectedMove = 0;

async function main(board, player, selectedMove){
    const {newBoard, hasWon, isTie, nextPlayer} =  await updateScore(board, player, selectedMove);
    console.log(newBoard, hasWon ,isTie, nextPlayer)
}

main(board,player,selectedMove);
