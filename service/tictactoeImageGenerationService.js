import { Jimp } from "jimp";
import { __dirname } from "../utils/constants.js";
import * as fs from "node:fs";

const ticTacToeSize = parseInt(process.env.TICTACTOE_SIZE) | 600;

const adaptDbScore = (score) => {

  const adaptedScore = []

  for (let i = 0; i < 3; i++) {
    const scoreLine = []
    for (let j = 0; j < 3; j++) {
      scoreLine.push(score[i*3+j]);
    }
    adaptedScore.push(scoreLine);
  }

  return adaptedScore
}

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
  const cross = await Jimp.read(`${__dirname}/assets/cross_180x180.png`);
  const circle = await Jimp.read(`${__dirname}/assets/circle_180x180.png`);

  const boxSize = ticTacToeSize / 3
  const sizeForCrossAndCircle = ticTacToeSize / 4
  const basePadding = (boxSize - sizeForCrossAndCircle) / 2;

  cross.resize({w: sizeForCrossAndCircle, h: sizeForCrossAndCircle});
  circle.resize({w: sizeForCrossAndCircle, h: sizeForCrossAndCircle});

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

  const image = await Jimp.read(`${__dirname}/assets/eggy.png`);

  const imgWidth = image.width;
  const ticTacToeXPadding = (imgWidth - ticTacToeSize) / 2;
  const fullGrid = await addScoreToGrid(createEmptyGrid(), adaptDbScore(score));
  await image.composite(fullGrid, ticTacToeXPadding, ticTacToeXPadding / 60);

  const randomUUID = crypto.randomUUID()

  await image.write(`${__dirname}/temp/${randomUUID}.png`);

  return randomUUID
}

export function deleteTttImage(imageFileName){
  fs.rm(`${__dirname}/temp/${imageFileName}.png`, { recursive: true }, (err) => {
    if (err) console.log(err);
  });
}
