import { checkCell } from "./checkCell";
import { getLowestEmptyCell } from "./getLowestEmptyCell";
import { DEFAULT_BOARD_CELLS } from "./constants";
import type { Board, MoveStrategy } from "./types";

const WIN_SCORE = 1_000_000;
const MIN_AI_DEPTH = 4;

const isWin = <TValue>(cell: number, board: Board<TValue>): boolean =>
  Object.values(checkCell(cell, board)).some((cells) => cells.length >= 4);

const simulate = <TValue>(
  board: Board<TValue>,
  cell: number,
  value: TValue,
): Board<TValue> => {
  const newValues = [...board.values];
  newValues[cell] = value;
  return { ...board, values: newValues };
};

const scoreWindow = <TValue>(
  window: (TValue | undefined)[],
  playerValue: TValue,
  opponentValue: TValue,
): number => {
  const playerCount = window.filter((v) => v === playerValue).length;
  const opponentCount = window.filter((v) => v === opponentValue).length;

  if (playerCount > 0 && opponentCount > 0) return 0;
  if (playerCount === 3) return 100;
  if (opponentCount === 3) return -100;
  if (playerCount === 2) return 10;
  if (opponentCount === 2) return -10;
  return 0;
};

const evaluate = <TValue>(
  board: Board<TValue>,
  playerValue: TValue,
  opponentValue: TValue,
): number => {
  const { rows, columns, values } = board;
  let score = 0;

  const center = Math.floor(columns / 2);
  for (let r = 0; r < rows; r++) {
    if (values[r * columns + center] === playerValue) score += 3;
    else if (values[r * columns + center] === opponentValue) score -= 3;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= columns - 4; c++) {
      score += scoreWindow(
        [
          values[r * columns + c],
          values[r * columns + c + 1],
          values[r * columns + c + 2],
          values[r * columns + c + 3],
        ],
        playerValue,
        opponentValue,
      );
    }
  }

  for (let r = 0; r <= rows - 4; r++) {
    for (let c = 0; c < columns; c++) {
      score += scoreWindow(
        [
          values[r * columns + c],
          values[(r + 1) * columns + c],
          values[(r + 2) * columns + c],
          values[(r + 3) * columns + c],
        ],
        playerValue,
        opponentValue,
      );
    }
  }

  for (let r = 0; r <= rows - 4; r++) {
    for (let c = 0; c <= columns - 4; c++) {
      score += scoreWindow(
        [
          values[r * columns + c],
          values[(r + 1) * columns + (c + 1)],
          values[(r + 2) * columns + (c + 2)],
          values[(r + 3) * columns + (c + 3)],
        ],
        playerValue,
        opponentValue,
      );
    }
  }

  for (let r = 0; r <= rows - 4; r++) {
    for (let c = 3; c < columns; c++) {
      score += scoreWindow(
        [
          values[r * columns + c],
          values[(r + 1) * columns + (c - 1)],
          values[(r + 2) * columns + (c - 2)],
          values[(r + 3) * columns + (c - 3)],
        ],
        playerValue,
        opponentValue,
      );
    }
  }

  return score;
};

// Sort all columns center-out once for a given board width; order never changes during a search.
const getSortedColumnOrder = (columns: number): number[] => {
  const center = Math.floor(columns / 2);
  return Array.from({ length: columns }, (_, i) => i).sort(
    (a, b) => Math.abs(a - center) - Math.abs(b - center),
  );
};

const getValidColumns = <TValue>(
  sortedOrder: number[],
  board: Board<TValue>,
): number[] => sortedOrder.filter((c) => board.values[c] == null);

// Always maximizes from the current player's perspective; negate the result at each level.
const negamax = <TValue>(
  board: Board<TValue>,
  depth: number,
  alpha: number,
  beta: number,
  currentValue: TValue,
  nextValue: TValue,
  lastCell: number | null,
  sortedColumnOrder: number[],
): number => {
  // The previous player just moved; if they won, the current player loses.
  if (lastCell !== null && isWin(lastCell, board)) return -(WIN_SCORE + depth);

  const validColumns = getValidColumns(sortedColumnOrder, board);
  if (validColumns.length === 0) return 0;
  if (depth === 0) return evaluate(board, currentValue, nextValue);

  let maxScore = -Infinity;
  for (const column of validColumns) {
    const cell = getLowestEmptyCell(column, board);
    if (cell == null) continue;
    const score = -negamax(
      simulate(board, cell, currentValue),
      depth - 1,
      -beta,
      -alpha,
      nextValue,
      currentValue,
      cell,
      sortedColumnOrder,
    );
    if (score > maxScore) maxScore = score;
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
  }
  return maxScore;
};

const getReactiveMove = <TValue>(
  playerValue: TValue,
  opponentValue: TValue,
  board: Board<TValue>,
): number | undefined => {
  const validColumns = getValidColumns(
    getSortedColumnOrder(board.columns),
    board,
  );
  if (validColumns.length === 0) return undefined;

  for (const column of validColumns) {
    const cell = getLowestEmptyCell(column, board);
    if (cell == null) continue;
    if (isWin(cell, simulate(board, cell, playerValue))) return column;
  }

  for (const column of validColumns) {
    const cell = getLowestEmptyCell(column, board);
    if (cell == null) continue;
    if (isWin(cell, simulate(board, cell, opponentValue))) return column;
  }

  return validColumns[Math.floor(Math.random() * validColumns.length)];
};

export const getBestMove = <TValue>(
  playerValue: TValue,
  opponentValue: TValue,
  board: Board<TValue>,
  strategy: MoveStrategy,
): number | undefined => {
  if (strategy.type === "reactive") {
    return getReactiveMove(playerValue, opponentValue, board);
  }

  const sortedColumnOrder = getSortedColumnOrder(board.columns);
  const validColumns = getValidColumns(sortedColumnOrder, board);
  if (validColumns.length === 0) return undefined;

  // Scale depth proportionally to board size so search time stays bounded on large boards.
  // Clamp at strategy.depth so small boards don't upscale beyond the configured difficulty.
  const scaledDepth = Math.min(
    strategy.depth,
    Math.max(
      MIN_AI_DEPTH,
      Math.round(
        (strategy.depth * DEFAULT_BOARD_CELLS) / (board.rows * board.columns),
      ),
    ),
  );

  let bestColumn: number = validColumns[0]!;
  let bestScore = -Infinity;

  for (const column of validColumns) {
    const cell = getLowestEmptyCell(column, board);
    if (cell == null) continue;
    const score = -negamax(
      simulate(board, cell, playerValue),
      scaledDepth - 1,
      -Infinity,
      Infinity,
      opponentValue,
      playerValue,
      cell,
      sortedColumnOrder,
    );
    if (score > bestScore) {
      bestScore = score;
      bestColumn = column;
    }
  }

  return bestColumn;
};
