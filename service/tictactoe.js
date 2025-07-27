const { Jimp } = require("jimp");

const ticTacToeSize = parseInt(process.env.TICTACTOE_SIZE) | 600;

// Score template
// [
//   ["x", "", "o"],
//   ["o", "", "x"],
//   ["x", "o", "x"]
// ]

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
