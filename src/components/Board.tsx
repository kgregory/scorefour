import type { ReactNode } from "react";
import type { BoardValue, PlayerColor, PlayerWin } from "~/utils/types";
import { Circle } from "./Circle";

const boardValueToColor = (value: BoardValue): PlayerColor =>
  (value?.replace(/-win$/, "") as PlayerColor) ?? "empty";

const isWinValue = (value: BoardValue): value is PlayerWin =>
  Boolean(value?.endsWith("-win"));

interface BoardFrameProps {
  columns: number;
  children: ReactNode;
}

const BoardFrame = ({ columns, children }: BoardFrameProps) => (
  <div className="min-w-96 border-8 border-solid border-blue-600 bg-gradient-to-b from-blue-700 to-blue-800 p-2 shadow-inner drop-shadow-md">
    <div
      className="grid justify-items-center gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {children}
    </div>
  </div>
);

interface BoardProps {
  values: BoardValue[];
  columns: number;
  rows: number;
  isEmphasized?: boolean;
  onCellClick?: (column: number) => void;
}

/** renders the full visual board from explicit values — no context dependencies */
export const Board = ({
  values,
  columns,
  rows,
  isEmphasized = true,
  onCellClick,
}: BoardProps) => (
  <BoardFrame columns={columns}>
    {Array.from({ length: columns * rows }, (_, i) => (
      <Circle
        key={i}
        color={boardValueToColor(values[i])}
        isEmphasized={isEmphasized}
        isWinner={isWinValue(values[i])}
        onClick={
          onCellClick != null ? () => onCellClick(i % columns) : undefined
        }
      />
    ))}
  </BoardFrame>
);
