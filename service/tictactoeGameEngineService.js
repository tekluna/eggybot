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
    for (let i = 0; i < board.length; i++) {
        if (board[i] === player) {
            playedMoves.push(i);
        }
    }
    return playedMoves;
}

function findAllMoves(board) {
    const allPlayedMoves = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "x" || board[i] === "o") {
            allPlayedMoves.push(i);
        }
    }
    return allPlayedMoves;
}

function findMovesAmmount(board) {
    let movesAmmount = 0;
    for (let i = 0; i < board.length; i++) {
        if (board[i] !== "") {
            movesAmmount++;
        }
    }
    return movesAmmount;
}

function checkWin(playedMoves) {
    return winCombos.some((combo) =>
        combo.every((pos) => playedMoves.includes(pos - 1))
    );
}

function playMove(currentPlayer, board, selectedMove) {

    const nextPlayer = currentPlayer === "x" ? "o" : "x";
    let newBoard = board;
    const allPlayedMoves = findAllMoves(board);

    // Check if the selected move is valid
    if (selectedMove < 0 || selectedMove >= 9 || isNaN(selectedMove)) {
        throw new Error("This move is not valid!")
    }
    // Check if the selected move is already taken
    if (allPlayedMoves.includes(selectedMove)) {
        throw new Error("This move has already been played!");
    }

    if (newBoard[selectedMove] === "") {
        newBoard[selectedMove] = currentPlayer;

        const playedMoves = findPlayedMoves(newBoard, currentPlayer);
        const hasWon = checkWin(playedMoves);
        const movesAmmount = findMovesAmmount(board);

        if (hasWon === true) {
            console.log(`${currentPlayer} wins!`);
            return { newBoard, hasWon, currentPlayer };
        } else {
            if (movesAmmount === 9) {
                return { newBoard, tie: true};
            }
        }
        return { newBoard, hasWon: false, nextPlayer };
    }
}
// // tests
// xPlayer = "o";
// xBoard = ["x", "x", "o", "x", "x", "o", "", "x", "x"];
// xSelectedMove = 6;
// console.log(playMove(xPlayer, xBoard, xSelectedMove));
