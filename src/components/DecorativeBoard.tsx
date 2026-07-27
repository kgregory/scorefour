import { useEffect, useState } from "react";
import { PLAYER_ONE, PLAYER_TWO, PLAYER_THREE, PLAYER_FOUR } from "~/utils/constants";
import { useColumns, useRows } from "~/context/GameState";
import { Circle } from "./Circle";
import type { CircleProps } from "./Circle";

const STRIPE_COLORS = [PLAYER_TWO, PLAYER_THREE, PLAYER_FOUR] as const;
const CYCLE_MS = 2000;

// Find the start of a centered 4-cell span within a dimension of `size`
const spanStart = (center: number, size: number): number =>
  Math.max(0, Math.min(Math.round(center - 1.5), size - 4));

// Returns the set of cell indices for the current phase's winning pattern.
// Phases cycle like the ASCII spinner: | / — \
const getPatternCells = (cols: number, rows: number, phase: number): Set<number> => {
  const cc = Math.floor(cols / 2);
  const cr = Math.floor(rows / 2);
  const sc = spanStart(cc, cols);
  const sr = spanStart(cr, rows);

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

export const DecorativeBoard = () => {
  const columns = useColumns();
  const rows = useRows();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPhase((p) => p + 1), CYCLE_MS);
    return () => clearInterval(interval);
  }, []);

  const patternCells = getPatternCells(columns, rows, phase);

  return (
    <div className="min-w-96 border-8 border-solid border-blue-600 bg-gradient-to-b from-blue-700 to-blue-800 p-2 shadow-inner drop-shadow-md">
      <div
        className="grid justify-items-center gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array(columns * rows)
          .fill(null)
          .map((_, i) => {
            const row = Math.floor(i / columns);
            const color: CircleProps["color"] = patternCells.has(i)
              ? PLAYER_ONE
              : STRIPE_COLORS[row % STRIPE_COLORS.length];
            return (
              <Circle
                key={i}
                color={color}
                isEmphasized={false}
                isWinner={patternCells.has(i)}
              />
            );
          })}
      </div>
    </div>
  );
};
