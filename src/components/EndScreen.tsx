import { useState } from "react";
import { PLAYER_ONE } from "~/utils/constants";
import {
  usePlayers,
  useWinner,
  useWasQuit,
  useValues,
  useColumns,
  useRows,
} from "~/context/GameState";
import { Board } from "./Board";
import { Circle } from "./Circle";
import { Heading } from "./Heading";
import { GameSettings } from "./GameSettings";
import type { BoardValue, Player, Players } from "~/utils/types";

interface EndScreenProps {
  onPlayAgain: () => void;
}

interface EndSnapshot {
  values: BoardValue[];
  columns: number;
  rows: number;
  winner: Player | "draw" | null;
  wasQuit: Player | null;
  players: Players;
}

export const EndScreen = ({ onPlayAgain }: EndScreenProps) => {
  // Freeze all result state at mount so nothing shifts during the fade-out transition.
  const liveWinner = useWinner();
  const liveWasQuit = useWasQuit();
  const livePlayers = usePlayers();
  const liveValues = useValues();
  const liveColumns = useColumns();
  const liveRows = useRows();
  const [snap] = useState<EndSnapshot>(() => ({
    winner: liveWinner,
    wasQuit: liveWasQuit,
    players: livePlayers,
    values: [...liveValues],
    columns: liveColumns,
    rows: liveRows,
  }));

  const { winner, wasQuit, players } = snap;

  const isTryAgain =
    players === 1 &&
    (wasQuit != null ||
      (winner !== null && winner !== "draw" && winner !== PLAYER_ONE));

  return (
    <div className="flex flex-col items-center gap-8">
      <Heading>
        <button
          onClick={onPlayAgain}
          className="rounded bg-blue-600 px-6 py-2 font-semibold text-white shadow hover:bg-blue-700"
        >
          {isTryAgain ? "Try Again" : "Play Again"}
        </button>
      </Heading>
      <Board values={snap.values} columns={snap.columns} rows={snap.rows} />
      <div className="flex flex-col items-center gap-3">
        {wasQuit != null ? (
          <div className="flex items-center gap-2 text-2xl font-bold text-slate-700">
            <Circle color={wasQuit} isEmphasized={false} isDense />
            <span className="capitalize">{wasQuit} Quit.</span>
          </div>
        ) : winner === "draw" ? (
          <p className="text-2xl font-bold text-slate-700">It&apos;s a draw!</p>
        ) : winner != null ? (
          <div className="flex items-center gap-2 text-2xl font-bold text-slate-700">
            <Circle color={winner} isEmphasized={false} isDense />
            <span className="capitalize">
              {players === 1 && winner === PLAYER_ONE
                ? "You win!"
                : `${winner} wins!`}
            </span>
          </div>
        ) : null}
        <GameSettings />
      </div>
    </div>
  );
};
