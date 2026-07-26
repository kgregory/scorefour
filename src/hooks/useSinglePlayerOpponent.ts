import { useEffect } from "react";
import type { Player } from "../utils/types";
import { DIFFICULTY_STRATEGY } from "../utils/types";
import { getBestMove } from "~/utils/getBestMove";
import {
  useColumns,
  useRows,
  usePlayers,
  useCurrentPlayer,
  useValues,
  useDifficulty,
} from "~/context/GameState";

interface UseSinglePlayerOpponentParams {
  firstPlayer: Player;
  secondPlayer: Player;
  update: (column: number) => void;
}

/** controls the opponent when running in single player mode */
export const useSinglePlayerOpponent = (
  params: UseSinglePlayerOpponentParams,
) => {
  const { firstPlayer, secondPlayer, update } = params;

  const players = usePlayers();
  const columns = useColumns();
  const rows = useRows();
  const currentPlayer = useCurrentPlayer();
  const values = useValues();
  const difficulty = useDifficulty();

  // this effect is used to simulate an AI player when there is only one player
  // it will review the available moves and pick the one that scores the highest according to its rules
  useEffect(() => {
    if (players === 1 && currentPlayer === secondPlayer) {
      const timeout = setTimeout(() => {
        const column = getBestMove(currentPlayer, firstPlayer, { rows, columns, values }, DIFFICULTY_STRATEGY[difficulty]);

        if (column != null) {
          update(column);
        }
      }, 500);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [
    columns,
    currentPlayer,
    difficulty,
    firstPlayer,
    players,
    rows,
    secondPlayer,
    update,
    values,
  ]);
};
