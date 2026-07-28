import type { BoardValue, PlayerColor, PlayerWin } from "~/utils/types";
import { Circle } from "./Circle";
import { BoardShell } from "./BoardShell";

const boardValueToColor = (value: BoardValue): PlayerColor =>
  (value?.replace(/-win$/, "") as PlayerColor) ?? "empty";

const isWinValue = (value: BoardValue): value is PlayerWin =>
  Boolean(value?.endsWith("-win"));

export interface BoardDisplayProps {
  values: BoardValue[];
  columns: number;
  rows: number;
  onCellClick?: (column: number) => void;
}

/** renders the full visual board from explicit values — no context dependencies */
export const BoardDisplay = ({
  values,
  columns,
  rows,
  onCellClick,
}: BoardDisplayProps) => (
  <BoardShell columns={columns}>
    {Array.from({ length: columns * rows }, (_, i) => (
      <Circle
        key={i}
        color={boardValueToColor(values[i])}
        isEmphasized
        isWinner={isWinValue(values[i])}
        onClick={
          onCellClick != null ? () => onCellClick(i % columns) : undefined
        }
      />
    ))}
  </BoardShell>
);
