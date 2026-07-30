import { useEffect, useState } from "react";
import {
  PLAYER_ONE,
  PLAYER_TWO,
  PLAYER_THREE,
  PLAYER_FOUR,
} from "~/utils/constants";
import type { BoardValue } from "~/utils/types";
import { useColumns, useRows } from "~/context/GameState";
import { Board } from "./Board";
import { Heading } from "./Heading";
import { GameSettings } from "./GameSettings";

const STRIPE_COLORS = [PLAYER_TWO, PLAYER_THREE, PLAYER_FOUR] as const;
const CYCLE_MS = 2000;

// Find the start of a centered 4-cell span within a dimension of `size`
const spanStart = (size: number): number =>
  Math.max(0, Math.floor((size - 4) / 2));

// Returns the set of cell indices for the current phase's winning pattern.
// Phases cycle like the ASCII spinner: | / — \
const getPatternCells = (
  cols: number,
  rows: number,
  phase: number,
): Set<number> => {
  const cc = Math.floor(cols / 2);
  const cr = Math.floor(rows / 2);
  const sc = spanStart(cols);
  const sr = spanStart(rows);

  let cells: number[];
  switch (phase % 4) {
    case 0: // | vertical
      cells = [0, 1, 2, 3].map((i) => (sr + i) * cols + cc);
      break;
    case 1: // / anti-diagonal
      cells = [0, 1, 2, 3].map((i) => (sr + 3 - i) * cols + sc + i);
      break;
    case 2: // — horizontal
      cells = [0, 1, 2, 3].map((i) => cr * cols + sc + i);
      break;
    default: // \ diagonal
      cells = [0, 1, 2, 3].map((i) => (sr + i) * cols + sc + i);
      break;
  }

  return new Set(cells);
};

const DecorativeBoard = () => {
  const columns = useColumns();
  const rows = useRows();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPhase((p) => p + 1), CYCLE_MS);
    return () => clearInterval(interval);
  }, []);

  const patternCells = getPatternCells(columns, rows, phase);

  const values: BoardValue[] = Array.from(
    { length: columns * rows },
    (_, i) => {
      const row = Math.floor(i / columns);
      if (patternCells.has(i)) return `${PLAYER_ONE}-win`;
      return STRIPE_COLORS[row % STRIPE_COLORS.length]!;
    },
  );

  return (
    <Board values={values} columns={columns} rows={rows} isEmphasized={false} />
  );
};

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => (
  <div className="flex flex-col items-center gap-8">
    <Heading>
      <button
        onClick={onStart}
        className="rounded bg-blue-600 px-6 py-2 font-semibold text-white shadow hover:bg-blue-700"
      >
        Start Game
      </button>
    </Heading>
    <DecorativeBoard />
    <div className="flex flex-col items-center gap-3">
      <GameSettings />
    </div>
  </div>
);
