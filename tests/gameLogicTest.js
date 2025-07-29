import {updateScore} from "../service/tictactoeGameEngineService.js";

const player = "o";
const board = ["x", "x", "o", "", "", "o", "", "", "x"];
const selectedMove = 7;


const {newBoard, hasWon, isTie, nextPlayer} =  await updateScore(board, player, selectedMove);
console.log(newBoard, hasWon ,isTie, nextPlayer)

