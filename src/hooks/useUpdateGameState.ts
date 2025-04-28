import { useCallback } from "react";
import { checkCell } from "~/utils/checkCell";
import { allPlayers, PLAYER_ONE } from "~/utils/constants";
import { getLowestEmptyCell } from "~/utils/getLowestEmptyCell";
import {
  usePlayers,
  useColumns,
  useRows,
  useValues,
  useCurrentPlayer,
  useWinner,
  useSetCurrentPlayer,
  useSetWinner,
  useSetValues,
} from "~/context/GameState";

/** returns a function that updates the game state by selecting the specified column for the current player */
export const useUpdateGameState = () => {
  const players = usePlayers();
  const columns = useColumns();
  const rows = useRows();
  const values = useValues();
  const currentPlayer = useCurrentPlayer();
  const winner = useWinner();
  const setCurrentPlayer = useSetCurrentPlayer();
  const setWinner = useSetWinner();
  const setValues = useSetValues();

  return useCallback(
    (column: number) => {
      if (winner != null) {
        // nothing to do when the game's over (someone won or the players tied)
        return;
      }

      // get the index of the cell that would be filled
      const cell = getLowestEmptyCell(column, {
        rows,
        columns,
        values,
      });

      if (cell == null) {
        // no need to check the board for an invalid move
        return;
      }

      const newValues = [...values];
      newValues[cell] = currentPlayer;

      // filter the adjoining cells by the directions that have at least 4 in a row
      const winningCells = Object.values(
        checkCell(cell, { columns, rows, values: newValues }),
      )
        .filter((direction) => direction.length > 3)
        .flat();

      // mark winning cells, if any
      winningCells.forEach((i) => {
        newValues[i] = `${currentPlayer}-win`;
      });

      if (winningCells.length > 0) {
        setWinner(currentPlayer);
      } else if (newValues.every((value) => value != null)) {
        // no winner and we're out of moves
        setWinner("draw");
      } else {
        setCurrentPlayer((player) => {
          const playerCount = players === 1 ? 2 : players;
          const playerIndex = allPlayers.indexOf(player);
          const nextPlayerIndex = (playerIndex + 1) % playerCount;
          const nextPlayer = allPlayers[nextPlayerIndex];
          return nextPlayer ?? PLAYER_ONE;
        });
      }

      setValues(newValues);
    },
    [
      columns,
      currentPlayer,
      players,
      rows,
      setCurrentPlayer,
      setValues,
      setWinner,
      values,
      winner,
    ],
  );
};
