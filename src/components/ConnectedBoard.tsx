import { useDebouncedInteraction } from "~/hooks/useDebouncedInteraction";
import { useColumns, useRows, useValues } from "~/context/GameState";
import { BoardDisplay } from "./BoardDisplay";

interface ConnectedBoardProps {
  handleTurn?: (column: number) => void;
}

/** context-connected board; reads columns/rows/values from game state */
export const ConnectedBoard = ({ handleTurn }: ConnectedBoardProps) => {
  const columns = useColumns();
  const rows = useRows();
  const values = useValues();

  const canClick = useDebouncedInteraction();

  return (
    <BoardDisplay
      values={values}
      columns={columns}
      rows={rows}
      onCellClick={
        handleTurn != null
          ? (column) => {
              if (canClick()) handleTurn(column);
            }
          : undefined
      }
    />
  );
};
