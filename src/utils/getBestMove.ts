import { checkCell } from "./checkCell";
import { getLowestEmptyCell } from "./getLowestEmptyCell";
import type { Board } from "./types";

/** return a random number within the specified range */
const getRandomWithinRange = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** get outcomes for a proposed move, returns a set of the continuous lengths of the specified value in any direction */
const getOutcomes = <TValue>(
  cell: number,
  newValue: TValue,
  board: Board<TValue>,
) => {
  const { columns, rows, values } = board;

  // create a copy of the provided values and set the specified cell to its new value
  const checkedValues = [...values];
  checkedValues[cell] = newValue;
  const checkedResults = checkCell(cell, {
    rows,
    columns,
    values: checkedValues,
  });

  return Object.values(checkedResults).reduce((acc, direction) => {
    acc.add(direction.length);
    return acc;
  }, new Set<number>());
};

/** get best of all available moves, determined by arbitrary scoring rules */
export const getBestMove = <TValue>(
  playerValue: TValue,
  opponentValue: TValue,
  board: Board<TValue>,
) => {
  const { columns, rows, values } = board;

  // get the available moves (columns with an empty cell)
  const validColumns: number[] = [];
  for (let c = 0; c < columns; c += 1) {
    if (values[c] == null) {
      validColumns.push(c);
    }
  }

  const scoredMoves = validColumns
    .map<[number, number]>((column) => {
      // get the index of the cell that would be filled
      const cell = getLowestEmptyCell(column, {
        rows,
        columns,
        values,
      });

      if (cell == null) {
        // not likely because we're processing valid columns,
        // but I don't feel like asserting non-null on this below
        return [column, 0];
      }

      // decide how this space would benefit the other player and the current player
      const opponentOutcomes = getOutcomes(cell, opponentValue, board);
      const playerOutcomes = getOutcomes(cell, playerValue, board);

      if (playerOutcomes.has(4)) {
        // player wins with this move
        return [column, getRandomWithinRange(1000, 1099)];
      }
      if (opponentOutcomes.has(4)) {
        // opponent wins with this move
        return [column, getRandomWithinRange(800, 899)];
      }
      if (playerOutcomes.has(3)) {
        // player will have 3 in a row
        return [column, getRandomWithinRange(600, 699)];
      }
      if (opponentOutcomes.has(3)) {
        // opponent will have 3 in a row
        return [column, getRandomWithinRange(400, 499)];
      }
      if (playerOutcomes.has(2)) {
        // player will have 2 in a row
        return [column, getRandomWithinRange(200, 299)];
      }
      if (opponentOutcomes.has(2)) {
        // opponent will have 2 in a row
        return [column, getRandomWithinRange(100, 199)];
      }
      return [column, getRandomWithinRange(1, 99)];
    })
    .sort((a, b) => b[1] - a[1]);

  return scoredMoves.length > 0 ? scoredMoves[0] : undefined;
};
