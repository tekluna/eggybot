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
    [1, 5, 9],
];

function findPlayedMoves(board, player) {
    const playedMoves = [];
    for (let i = 0; i < board.length ; i++) {
        if (board[i] === player){
            playedMoves.push(i);
        }
    }
    return playedMoves;
}

// checkWin(playedMoves)
function checkWin(playedMoves) {
    return winCombos.some((combo) =>
        combo.every((pos) => playedMoves.includes(pos - 1))
    );
}

function playMove(currentPlayer, board, selectedMove) {
    //selectedMove just needs to be a single integer from 0 to 8 in the bd i think

    const nextPlayer = currentPlayer === "x" ? "o" : "x";
    const playedMoves = findPlayedMoves(board, currentPlayer);
    let newBoard = board;
    console.log(board, playedMoves, currentPlayer, nextPlayer);
    let hasWon = checkWin(playedMoves); 

    if (playedMoves.length === 9) { // game is tied
        return;
    }
        if (selectedMove < 0 || selectedMove >= 9 || isNaN(selectedMove)) {
            // selectedMove is invalid
            return playMove(player);
        }

        if (newBoard[selectedMove] === "") {
            newBoard[selectedMove] = (currentPlayer); // boken
            console.log(newBoard);
            // write played pos in db

            if (hasWon === true) {
                console.log(`${currentPlayer} wins!`);
                return(newBoard, hasWon, nextPlayer);
            }
        } else {
            // selectedMove already played
            playMove(player);
        }
}

// tests
xPlayer = "x";
xBoard = ["", "x", "", "", "", "o", "", "x", "x"];
xSelectedMove = 0;
console.log(playMove(xPlayer, xBoard, xSelectedMove)); // should return next player and new board
