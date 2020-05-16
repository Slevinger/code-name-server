const getWords = require("../consts/words");

const decideIfColor = (cellLeft, cellsLeftToColor) =>
  cellsLeftToColor / cellLeft >= Math.random();

const decideWhichColor = (
  redCellsToColor,
  blueCellsToColor,
  blackCellsToColor
) => {
  const redArr = Array.from(Array(redCellsToColor)).map(() => "red");
  const blueArr = Array.from(Array(blueCellsToColor)).map(() => "blue");
  const blackArr = Array.from(Array(blackCellsToColor)).map(() => "black");
  const colorsBucket = [...redArr, ...blueArr, ...blackArr];
  const index = Math.floor(
    Math.random() * redCellsToColor + blueCellsToColor + blackCellsToColor
  );
  return colorsBucket[index];
};

const createBoard = ({ blue, red }) => {
  const cellsMap = {};
  const words = getWords(25);
  let cellsLeft = 25;
  const cellsToColor = {
    red,
    blue,
    black: 1
  };

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      let color = "white";
      if (
        decideIfColor(
          cellsLeft,
          Object.values(cellsToColor).reduce((acc, count) => acc + count, 0)
        )
      ) {
        color = decideWhichColor(
          cellsToColor.red,
          cellsToColor.blue,
          cellsToColor.black
        );
        cellsToColor[color] = cellsToColor[color] - 1;
      }

      cellsMap[`${i},${j}`] = {
        showColor: false,
        word: words[25 - cellsLeft],
        color: color
      };
      cellsLeft--;
    }
  }

  return { cellsMap, red, blue };
};

module.exports = createBoard;
