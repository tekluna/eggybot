const readline = require("readline");

const board = Array(9).fill("---");
const separator = " | ";

let gameState = 0;
const playedPositionsP1 = [];
const playedPositionsP2 = [];

// cli specific stuff
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function printBoard() {
    for (let i = 0; i < board.length; i += 3) {
        console.log(board.slice(i, i + 3).join(separator));
    }
}
const winCombos = [
  // Rows
  [7, 8, 9],
  [4, 5, 6],
  [1, 2, 3],

  // Columns
  [7, 4, 1],
  [8, 5, 2],
  [9, 6, 3],

  // Diagonals
  [7, 5, 3],
  [1, 5, 9]
];

// function checkWin(playerPositions) 
function checkWin(playerPositions) {
    return winCombos.some(combo => 
        combo.every(pos => playerPositions.includes(pos - 1))
    );
}

function playMove(player) {
    const playerSymbol = "-X-";
    if (gameState === 9) {
        console.log("Game over!");
        rl.close();
        return;
    } else {
        rl.question(`Player ${player}, choose a position (1-9): `, (answer) => {
            const position = parseInt(answer, 10) - 1;

            if (position < 0 || position >= 9 || isNaN(position)) {
                console.log("Invalid input. Try a number between 1 and 9.");
                return playMove(player);
            }

            if (board[position] === "---") {
                board[position] = playerSymbol;
                gameState++;
                playedPositionsP1.push(position);
                console.log(gameState);
                printBoard();
                if (checkWin(playedPositionsP1)) {
                    console.log(`Player ${player} wins!`);
                    rl.close();
                    return;
                }
                console.log(
                    `Player ${player} played at position ${position + 1}\n`
                );
                playMove2("2");
            } else {
                console.log("Position already taken. Try again.\n");
                playMove(player);
            }
        });
    }
}

function playMove2(player) {
    const playerSymbol = "-O-";

    if (gameState === 9) {
        console.log("Game over! Its a tie!");
        rl.close();
        return;
    } else {
        rl.question(`Player ${player}, choose a position (1-9): `, (answer) => {
            const position = parseInt(answer, 10) - 1;

            if (position < 0 || position >= 9 || isNaN(position)) {
                console.log("Invalid input. Try a number between 1 and 9.");
                return playMove(player);
            }

            if (board[position] === "---") {
                board[position] = playerSymbol;
                gameState++;
                playedPositionsP2.push(position);
                console.log(gameState);
                printBoard();
                if (checkWin(playedPositionsP2)) {
                    console.log(`Player ${player} wins!`);
                    rl.close();
                    return;
                }
                console.log(
                    `Player ${player} played at position ${position + 1}\n`
                );
                playMove("1");
            } else {
                console.log("Position already taken. Try again.\n");
                playMove2(player);
            }
        });
    }
}

printBoard();
playMove("1");
