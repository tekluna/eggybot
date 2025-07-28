const { Jimp } = require("jimp");

const ticTacToeSize = parseInt(process.env.TICTACTOE_SIZE) | 600;

const checkForTie = (board) => {
  let isTie = true;
  board.forEach(line => isTie = isTie && line.every(move => move !== ""))
  return isTie;
}

const checkForWin = (board) => {
  const reversedBoard = []
  for (let x = 0; x < 3; x++) {
    const reversedLine = []
    for (let y = 0; y < 3; y++) {
      reversedLine.push(board[y][x])
    }
    reversedBoard.push(reversedLine)
  }


  const diagonalsBoard = []
  for (let y = 0; y < 3; y++) {
    diagonalsBoard.push(board[y][y])
  }
  for (let y = 0; y < 3; y++) {
    diagonalsBoard.push(board[y][3 - y])
  }

  for (let x = 0; x < 3; x++) {
    if (board[x].every(box => box === "x" || box === "o")){
      return true
    }
    if (reversedBoard[x].every(box => box === "x" || box === "o")){
      return true
    }
    if (diagonalsBoard.every(box => box === "x" || box === "o")){
      return true
    }
  }

  return false
}

const makeMove = (board, player, move) => {
  const line = Math.floor((move - 1) / 3)
  const column = (move - 1) % 3
  board[line][column] = player ? "x" : "o"
  if (checkForTie(board)) console.log("ITS A TIE");
  if (checkForWin(board)) console.log("YOU WON");
  return { board, player, move };
}

const dbBoard = [
  ["x", "", "o"],
  ["x", "o", ""],
  ["o", "x", "x"]
];

const moveToPlay = 4

const player = "x"

console.log(makeMove(dbBoard, player, moveToPlay));

const createEmptyGrid = () => {
  const grid = new Jimp({ width: ticTacToeSize, height: ticTacToeSize, color: 0x00000000 });
  for (let i = 1; i < 3; i++) {
    const padding = ticTacToeSize * i / 3
    const columnLine = new Jimp({ width: Math.round(ticTacToeSize / 100), height: ticTacToeSize, color: 0x000000ff });
    const rowLine = new Jimp({ width: ticTacToeSize, height: Math.round(ticTacToeSize / 100), color: 0x000000ff });
    grid.composite(columnLine, padding, 0);
    grid.composite(rowLine, 0, padding);
  }
  return grid;
}

const addScoreToGrid = async (grid, score) => {
  const cross = await Jimp.read("../assets/cross_180x180.png");
  const circle = await Jimp.read("../assets/circle_180x180.png");

  const boxSize = ticTacToeSize / 3
  const sizeForCrossAndCircle = ticTacToeSize / 4
  const basePadding = (boxSize - sizeForCrossAndCircle) / 2;

  cross.resize({w: sizeForCrossAndCircle, h: sizeForCrossAndCircle});
  circle.resize({w: sizeForCrossAndCircle, h: sizeForCrossAndCircle})

  for (let y = 0; y < score.length; y++) {
    const yPadding = basePadding + boxSize * y;

    for (let x = 0; x < score[y].length; x++) {
      const xPadding = basePadding + boxSize * x;
      const box = score[y][x]

      if (box !== ""){
        grid.composite(box === "x" ? cross : circle, xPadding, yPadding);
      }
    }
  }
  return grid;
}

export async function generateTttImage(score){

  const image = await Jimp.read("../assets/eggy_1637x1067.png");

  const imgWidth = image.width;
  const ticTacToeXPadding = (imgWidth - ticTacToeSize) / 2;
  const fullGrid = await addScoreToGrid(createEmptyGrid(), score);
  image.composite(fullGrid, ticTacToeXPadding, ticTacToeXPadding / 60);

  const randomUUID = crypto.randomUUID()

  await image.write(`../temp/${randomUUID}.png`);

  return `${randomUUID}.png`
}
