import { describe, test, expect } from "vitest";
import { checkCell } from "../checkCell";
import type { Board } from "../types";

test("returns empty arrays when the cell value is null or undefined", () => {
  const mockBoard: Board<string | null> = {
    rows: 4,
    columns: 4,
    values: [
      [null, "O", "X", "X"],
      ["O", "X", "O", "X"],
      ["X", "O", "X", "O"],
      ["O", "X", "O", "X"],
    ].flat(),
  };
  const result = checkCell(0, mockBoard);
  expect(result.vertical).toEqual([]);
  expect(result.horizontal).toEqual([]);
  expect(result.diagonal).toEqual([]);
  expect(result.reverseDiagonal).toEqual([]);
});

describe("checkered board", () => {
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

  test("returns expected values for non-corner cells", () => {
    // cell 5 is "X"
    // vertical: OXOX (1 consecutive)
    // horizontal: OXOX (1 consecutive)
    // diagonal: XXXX (4 consecutive)
    // reverseDiagonal: XXX (3 consecutive, cut-off edge)
    const middleLeftCell = checkCell(5, mockBoard);
    expect(middleLeftCell.vertical).toEqual([5]);
    expect(middleLeftCell.horizontal).toEqual([5]);
    expect(middleLeftCell.diagonal).toEqual([5, 0, 10, 15]);
    expect(middleLeftCell.reverseDiagonal).toEqual([5, 2, 8]);

    // cell 6 is "O"
    // vertical: OXOX (1 consecutive)
    // horizontal: OXOX (1 consecutive)
    // diagonal: OOO (3 consecutive, cut-off edge)
    // reverseDiagonal: OOOO (4 consecutive)
    const middleRightCell = checkCell(6, mockBoard);
    expect(middleRightCell.vertical).toEqual([6]);
    expect(middleRightCell.horizontal).toEqual([6]);
    expect(middleRightCell.diagonal).toEqual([6, 1, 11]);
    expect(middleRightCell.reverseDiagonal).toEqual([6, 3, 9, 12]);
  });

  test("returns expected values for corner cells", () => {
    // cell 0 is "X"
    // vertical: XOXO (1 consecutive)
    // horizontal: XOX0 (1 consecutive)
    // diagonal: XXXX (4 consecutive)
    // reverseDiagonal: X (1 consecutive, cut-off edge)
    const topLeft = checkCell(0, mockBoard);
    expect(topLeft.vertical).toEqual([0]);
    expect(topLeft.horizontal).toEqual([0]);
    expect(topLeft.diagonal).toEqual([0, 5, 10, 15]);
    expect(topLeft.reverseDiagonal).toEqual([0]);

    // cell 3 is "X"
    // vertical: XOXO (1 consecutive)
    // horizontal: XOX0 (1 consecutive)
    // diagonal: X (1 consecutive, cut-off edge)
    // reverseDiagonal: XXXX (4 consecutive)
    const topRight = checkCell(3, mockBoard);
    expect(topRight.vertical).toEqual([3]);
    expect(topRight.horizontal).toEqual([3]);
    expect(topRight.diagonal).toEqual([3]);
    expect(topRight.reverseDiagonal).toEqual([3, 6, 9, 12]);

    // cell 12 is "O"
    // vertical: OXOX (1 consecutive)
    // horizontal: OXOX (1 consecutive)
    // diagonal: O (1 consecutive, cut-off edge)
    // reverseDiagonal: OXOX (1 consecutive)
    const bottomLeft = checkCell(12, mockBoard);
    expect(bottomLeft.vertical).toEqual([12]);
    expect(bottomLeft.horizontal).toEqual([12]);
    expect(bottomLeft.diagonal).toEqual([12]);
    expect(bottomLeft.reverseDiagonal).toEqual([12, 9, 6, 3]);

    // cell 15 is "X"
    // vertical: OXOX (1 consecutive)
    // horizontal: OXOX (1 consecutive)
    // diagonal: O (1 consecutive, cut-off edge)
    // reverseDiagonal: OXOX (1 consecutive)
    const bottomRight = checkCell(15, mockBoard);
    expect(bottomRight.vertical).toEqual([15]);
    expect(bottomRight.horizontal).toEqual([15]);
    expect(bottomRight.diagonal).toEqual([15, 10, 5, 0]);
    expect(bottomRight.reverseDiagonal).toEqual([15]);
  });
});
