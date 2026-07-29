import { useState } from "react";
import { PLAYER_ONE } from "~/utils/constants";
import { useGameMode, usePlayers, useWinner, useWasQuit, useValues, useColumns, useRows } from "~/context/GameState";
import { BoardDisplay } from "./BoardDisplay";
import { Circle } from "./Circle";
import type { BoardValue, GameMode, Player, Players } from "~/utils/types";

interface EndScreenProps {
  onPlayAgain: () => void;
  onBack: () => void;
  onQuitOnline?: () => void;
  opponentConnected?: boolean;
  opponentLeft?: boolean;
  localPlayer?: Player | null;
}

interface EndSnapshot {
  values: BoardValue[];
  columns: number;
  rows: number;
  winner: Player | "draw" | null;
  wasQuit: Player | null;
  players: Players;
  gameMode: GameMode;
}

export const EndScreen = ({ onPlayAgain, onBack, onQuitOnline, opponentConnected, opponentLeft, localPlayer }: EndScreenProps) => {
  // Freeze all result state at mount so nothing shifts during the fade-out transition.
  const liveGameMode = useGameMode();
  const liveWinner = useWinner();
  const liveWasQuit = useWasQuit();
  const livePlayers = usePlayers();
  const liveValues = useValues();
  const liveColumns = useColumns();
  const liveRows = useRows();
  const [snap] = useState<EndSnapshot>(() => ({
    gameMode: liveGameMode,
    winner: liveWinner,
    wasQuit: liveWasQuit,
    players: livePlayers,
    values: [...liveValues],
    columns: liveColumns,
    rows: liveRows,
  }));

  const { winner, wasQuit, players, gameMode } = snap;

  const showPlayAgain = gameMode === "online" && !!opponentConnected;

  const winMessage =
    localPlayer != null
      ? winner === localPlayer ? "You win!" : "You lose."
      : players === 1 && winner === PLAYER_ONE ? "You win!"
      : winner != null && winner !== "draw" ? `${winner} wins!`
      : "";

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="container px-4 pt-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-700">Score Four</h1>
      </div>
      <BoardDisplay values={snap.values} columns={snap.columns} rows={snap.rows} />
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
            <Circle color={localPlayer ?? winner} isEmphasized={false} isDense />
            <span>{winMessage}</span>
          </div>
        ) : null}
        {opponentLeft ? (
          <>
            <p className="text-sm text-slate-500">Opponent has left.</p>
            <button
              onClick={onQuitOnline ?? onBack}
              className="text-sm text-slate-500 underline hover:text-slate-700"
            >
              Back to menu
            </button>
          </>
        ) : showPlayAgain ? (
          <>
            <button
              onClick={onPlayAgain}
              className="rounded bg-blue-600 px-8 py-3 font-semibold text-white shadow hover:bg-blue-700"
            >
              Play Again
            </button>
            <button
              onClick={onQuitOnline}
              className="text-sm text-slate-500 underline hover:text-slate-700"
            >
              Quit
            </button>
          </>
        ) : gameMode === "online" ? (
          <button
            onClick={onQuitOnline ?? onBack}
            className="text-sm text-slate-500 underline hover:text-slate-700"
          >
            Back to menu
          </button>
        ) : (
          <>
            <button
              onClick={onPlayAgain}
              className="rounded bg-blue-600 px-8 py-3 font-semibold text-white shadow hover:bg-blue-700"
            >
              Play Again
            </button>
            <button
              onClick={onBack}
              className="text-sm text-slate-500 underline hover:text-slate-700"
            >
              Back to menu
            </button>
          </>
        )}
      </div>
    </div>
  );
};
