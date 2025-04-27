import { describe, test, expect } from "vitest";
import { getAdjacentCells } from "../getAdjacentCells";
import type { Board } from "../types";

test("returns matching adjacent cells for a given cell index", () => {
  const mockBoard: Board<string | null> = {
    rows: 4,
    columns: 4,
    values: [
      ["X", "O", "X", "O"],
      ["O", "X", "O", "X"],
      ["X", "O", "X", "O"],
      ["O", "X", "O", "X"],
    ].flat(),
  };

  const result = getAdjacentCells(5, mockBoard);

  expect(result.n).toBeUndefined();
  expect(result.ne).toEqual(2);
  expect(result.e).toBeUndefined();
  expect(result.se).toEqual(10);
  expect(result.s).toBeUndefined();
  expect(result.sw).toEqual(8);
  expect(result.w).toBeUndefined();
  expect(result.nw).toEqual(0);
});

test("returns undefined for out-of-bounds cells", () => {
  const mockBoard: Board<string | null> = {
    rows: 4,
    columns: 4,
    values: [
      ["X", "O", "X", "O"],
      ["O", "X", "O", "X"],
      ["X", "O", "X", "O"],
      ["O", "X", "O", "X"],
    ].flat(),
  };

  const result = getAdjacentCells(0, mockBoard);

  expect(result.n).toBeUndefined();
  expect(result.ne).toBeUndefined();
  expect(result.e).toBeUndefined();
  expect(result.se).toEqual(5);
  expect(result.s).toBeUndefined();
  expect(result.sw).toBeUndefined();
  expect(result.w).toBeUndefined();
  expect(result.nw).toBeUndefined();
});
