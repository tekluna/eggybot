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
    for (let i=0; i < board.lengt; i++){
        if (board[i] === player);
        playedMoves.push(i);
    }
    return playedMoves;
}

// checkWin(playedMoves)
function checkWin(playedMoves) {
    return winCombos.some((combo) =>
        combo.every((pos) => playedMoves.includes(pos - 1))
    );
}

function playMove(currentPlayer, board, selectedMove) { //selectedMove just needs to be a single integer from 0 to 8 in the bd i think

    const nextPlayer = currentPlayer === "X" ? "O" : "X";
    const playedMoves = findPlayedMoves(board, currentPlayer);
    const gameWon = checkWin(playedMoves);
    
    if (board.length === 9) {
        // game is tied
        return;
    } else {
        const selectedMove = parseInt(answer, 10) - 1;

        if (selectedMove < 0 || selectedMove >= 9 || isNaN(selectedMove)) {
            // selectedMove is invalid
            return playMove(player);
        }

        if (board[selectedMove] === "") {
            board[selectedMove] = symbol;
            gameState++;
            // write played pos in db

            if (checkWin(playedMovesX)) { //if isGameWon true the games gotta stop and currentPlayer wins
                // announce winner
                return;
            }
            // annonce played posotion
        } else {
            // selectedMove already played
            playMove(player);
        }
    }
    return(nextPlayer, board);
}
