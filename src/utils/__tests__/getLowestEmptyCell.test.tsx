import { describe, test, expect } from "vitest";
import { getLowestEmptyCell } from "../getLowestEmptyCell";
import type { Board } from "../types";

describe("getLowestEmptyCell function", () => {
  test("returns the index of the lowest empty cell in the specified column", () => {
    const mockBoard: Board<string | null> = {
      rows: 4,
      columns: 4,
      values: [
        [null, null, null, null],
        [null, null, null, "X"],
        [null, null, "X", "O"],
        [null, "X", "O", "X"],
      ].flat(),
    };

    expect(getLowestEmptyCell(0, mockBoard)).toEqual(12);
    expect(getLowestEmptyCell(1, mockBoard)).toEqual(9);
    expect(getLowestEmptyCell(2, mockBoard)).toEqual(6);
    expect(getLowestEmptyCell(3, mockBoard)).toEqual(3);
  });

  test("returns undefined if there are no empty cells in the column", () => {
    const mockBoard: Board<string | null> = {
      rows: 4,
      columns: 4,
      values: [
        ["X", "O", "X", "O"],
        ["O", "X", "O", "X"],
        ["X", "O", "X", "O"],
        ["X", "X", "O", "X"],
      ].flat(),
    };

    const result = getLowestEmptyCell(0, mockBoard);
    expect(result).toBeUndefined();
  });
});
