import type { Board } from "./types";

/** get the index of the specified column's lowest empty cell */
export const getLowestEmptyCell = <TValue>(
  column: number,
  board: Board<TValue>,
): number | undefined => {
  const { rows, columns, values } = board;
  for (let i = rows - 1; i >= 0; i -= 1) {
    const index = i * columns + column;
    if (values[index] == null) {
      return index;
    }
  }
  return undefined;
};
