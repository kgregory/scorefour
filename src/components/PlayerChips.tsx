import {
  PLAYER_ONE,
  PLAYER_TWO,
  PLAYER_THREE,
  PLAYER_FOUR,
} from "~/utils/constants";
import type { Player, Players } from "~/utils/types";
import { Circle } from "./Circle";

interface PlayerChipsProps {
  players: Players;
  currentPlayer: Player;
}

export const PlayerChips = ({ players, currentPlayer }: PlayerChipsProps) => (
  <div
    className="grid gap-2 sm:gap-4"
    style={{
      gridTemplateColumns: `repeat(${players < 3 ? 2 : players}, 1fr)`,
    }}
  >
    <Circle
      color={PLAYER_ONE}
      isDense
      isEmphasized={currentPlayer === PLAYER_ONE}
      className={currentPlayer !== PLAYER_ONE ? "opacity-50" : ""}
    />
    <Circle
      color={PLAYER_TWO}
      isDense
      isEmphasized={currentPlayer === PLAYER_TWO}
      className={currentPlayer !== PLAYER_TWO ? "opacity-50" : ""}
    />
    {players > 2 && (
      <Circle
        color={PLAYER_THREE}
        isDense
        isEmphasized={currentPlayer === PLAYER_THREE}
        className={currentPlayer !== PLAYER_THREE ? "opacity-50" : ""}
      />
    )}
    {players > 3 && (
      <Circle
        color={PLAYER_FOUR}
        isDense
        isEmphasized={currentPlayer === PLAYER_FOUR}
        className={currentPlayer !== PLAYER_FOUR ? "opacity-50" : ""}
      />
    )}
  </div>
);
