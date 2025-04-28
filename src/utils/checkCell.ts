import { getAdjacentCells } from "./getAdjacentCells";
import type { Board } from "./types";

type Direction = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

interface CheckDirectionParams<TValue> {
  cell: number | undefined;
  value: TValue;
  direction: Direction;
  board: Board<TValue>;
}

/** starting from the specified cell index, continuing in the specified direction, return an array of indexes for continuously matching cells */
const checkDirection = <TValue>({
  cell,
  value,
  direction,
  board,
}: CheckDirectionParams<TValue>): number[] => {
  const { values } = board;

  if (cell == null || values[cell] !== value) {
    return [];
  }

  const adjacentCell = getAdjacentCells(cell, board)[direction];

  return [
    cell,
    ...checkDirection({ cell: adjacentCell, value, direction, board }),
  ];
};

/** check horizontal, vertical, and diagonal from the specified cell index */
export const checkCell = <TValue>(cell: number, board: Board<TValue>) => {
  const { values } = board;

  const value = values[cell];

  if (value == null) {
    return {
      vertical: [],
      horizontal: [],
      diagonal: [],
      reverseDiagonal: [],
    };
  }

  const { n, ne, e, se, s, sw, w, nw } = getAdjacentCells(cell, board);

  const vertical = [
    cell,
    ...checkDirection({ cell: n, direction: "n", value, board }),
    ...checkDirection({ cell: s, direction: "s", value, board }),
  ];

  const horizontal = [
    cell,
    ...checkDirection({ cell: w, direction: "w", value, board }),
    ...checkDirection({ cell: e, direction: "e", value, board }),
  ];

  const diagonal = [
    cell,
    ...checkDirection({ cell: nw, direction: "nw", value, board }),
    ...checkDirection({ cell: se, direction: "se", value, board }),
  ];

  const reverseDiagonal = [
    cell,
    ...checkDirection({ cell: ne, direction: "ne", value, board }),
    ...checkDirection({ cell: sw, direction: "sw", value, board }),
  ];

  return {
    vertical,
    horizontal,
    diagonal,
    reverseDiagonal,
  };
};
