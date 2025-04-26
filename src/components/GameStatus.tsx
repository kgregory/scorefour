import { Circle } from "./Circle";
import {
  PLAYER_ONE,
  PLAYER_TWO,
  PLAYER_THREE,
  PLAYER_FOUR,
} from "../utils/constants";
import { usePlayers, useCurrentPlayer, useWinner } from "../context/GameState";

/** status indicator including all players, current players, and a brief description */
export const GameStatus = () => {
  const players = usePlayers();
  const currentPlayer = useCurrentPlayer();
  const winner = useWinner();

  return (
    <div className="container flex flex-col gap-2 px-4 pt-8">
      <div className="container flex items-center justify-between">
        <h1 className="grow-1 flex text-4xl font-extrabold tracking-tight text-slate-700">
          Score Four
        </h1>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${players < 3 ? 2 : players}, 1fr)`,
          }}
        >
          <Circle
            color="red"
            isEmphasized={currentPlayer === PLAYER_ONE}
            isDense
          />
          <Circle
            color="yellow"
            isEmphasized={currentPlayer === PLAYER_TWO}
            isDense
          />
          {players > 2 && (
            <Circle
              color="purple"
              isEmphasized={currentPlayer === PLAYER_THREE}
              isDense
            />
          )}
          {players > 3 && (
            <Circle
              color="green"
              isEmphasized={currentPlayer === PLAYER_FOUR}
              isDense
            />
          )}
        </div>
      </div>
      <div className="flex justify-end">
        {winner != null ? (
          winner === "draw" ? (
            <div>It&apos;s a draw!</div>
          ) : (
            <div className="capitalize">{winner} wins!</div>
          )
        ) : (
          <div>It&apos;s {currentPlayer}&apos;s turn</div>
        )}
      </div>
    </div>
  );
};
