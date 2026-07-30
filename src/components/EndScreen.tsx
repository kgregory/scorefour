import { useState } from "react";
import {
  usePlayers,
  useWinner,
  useWasQuit,
  useValues,
  useColumns,
  useRows,
} from "~/context/GameState";
import { Board } from "./Board";
import { Button } from "./Button";
import { Footer } from "./Footer";
import type { GameStatusState } from "./Footer";
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

  const status: GameStatusState | null =
    wasQuit != null
      ? { type: "quit", player: wasQuit }
      : winner === "draw"
        ? { type: "draw" }
        : winner != null
          ? { type: "win", player: winner }
          : null;

  return (
    <div className="flex flex-col items-center gap-8">
      <Heading>
        <Button onClick={onPlayAgain}>Play Again</Button>
      </Heading>
      <Board values={snap.values} columns={snap.columns} rows={snap.rows} />
      <Footer status={status} playersPerDevice={players}>
        <GameSettings />
      </Footer>
    </div>
  );
};
