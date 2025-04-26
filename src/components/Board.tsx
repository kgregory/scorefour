import { allPlayers } from "~/utils/constants";
import { useDebouncedInteraction } from "~/hooks/useDebouncedInteraction";
import type { BoardValue } from "~/utils/types";
import { Circle, type CircleProps } from "./Circle";
import { useColumns, useRows, useValues } from "~/context/GameState";

const valueColorMap = allPlayers.reduce((acc, player) => {
  acc.set(player, player);
  acc.set(`${player}-win`, player);
  return acc;
}, new Map<BoardValue, CircleProps["color"]>());

interface BoardProps {
  handleTurn: (column: number) => void;
}

/** game board, renders `Circle` based on configured rows, columns, and current values */
export const Board = (props: BoardProps) => {
  const { handleTurn } = props;

  const columns = useColumns();
  const rows = useRows();
  const values = useValues();

  // help prevent the user from accidentally clicking too fast and taking the other player's turn
  const canClick = useDebouncedInteraction();

  return (
    <div className="min-w-96 border-8 border-solid border-blue-600 bg-gradient-to-b from-blue-700 to-blue-800 p-2 shadow-inner drop-shadow-md">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array(columns * rows)
          .fill(null)
          .map((item, i) => (
            <Circle
              key={i}
              color={values[i] != null ? valueColorMap.get(values[i]) : "empty"}
              isWinner={values[i]?.includes("-win")}
              onClick={() => {
                if (canClick()) {
                  handleTurn(i % columns);
                }
              }}
            ></Circle>
          ))}
      </div>
    </div>
  );
};
