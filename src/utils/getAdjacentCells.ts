import type { Board } from "./types";

type Direction = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

const adjacentCellIndexes = new Map<
  string,
  Record<Direction, number | undefined>
>();

/** get the indexes of the adjacent cells in each direction, where applicable and memoize using a map keyed by the cell */
const getAdjacentCellIndexes = <TValue>(cell: number, board: Board<TValue>) => {
  const { columns, rows } = board;

  // key considers board-size
  const cellKey = `${cell}_${rows}_${columns}`;

  const cached = adjacentCellIndexes.get(cellKey);
  if (cached != null) {
    return cached;
  }

  // there might not be an adjacent cell in all directions
  const row = Math.floor(cell / columns);
  const hasN = cell >= columns;
  const hasE = Math.floor((cell + 1) / columns) <= row;
  const hasS = cell <= (rows - 1) * columns - 1;
  const hasW = Math.floor((cell - 1) / columns) >= row;
  const hasNW = hasN && hasW;
  const hasNE = hasN && hasE;
  const hasSW = hasS && hasW;
  const hasSE = hasS && hasE;

  // relative indices for each direction
  const n = cell - columns;
  const w = cell - 1;
  const e = cell + 1;
  const s = cell + columns;
  const ne = n + 1;
  const nw = n - 1;
  const se = s + 1;
  const sw = s - 1;

  const result = {
    n: hasN ? n : undefined,
    w: hasW ? w : undefined,
    e: hasE ? e : undefined,
    s: hasS ? s : undefined,
    ne: hasNE ? ne : undefined,
    nw: hasNW ? nw : undefined,
    se: hasSE ? se : undefined,
    sw: hasSW ? sw : undefined,
  };

  adjacentCellIndexes.set(cellKey, result);

  return result;
};

/** get cell index for each adjacent position, by direction */
export const getAdjacentCells = <TValue>(
  cell: number,
  board: Board<TValue>,
) => {
  const { values } = board;

  const { n, w, e, s, ne, se, sw, nw } = getAdjacentCellIndexes(cell, board);

  // return adjacent cells with matching values
  const value = values[cell];
  return {
    n: n != null && values[n] === value ? n : undefined,
    ne: ne != null && values[ne] === value ? ne : undefined,
    e: e != null && values[e] === value ? e : undefined,
    se: se != null && values[se] === value ? se : undefined,
    s: s != null && values[s] === value ? s : undefined,
    sw: sw != null && values[sw] === value ? sw : undefined,
    w: w != null && values[w] === value ? w : undefined,
    nw: nw != null && values[nw] === value ? nw : undefined,
  };
};
