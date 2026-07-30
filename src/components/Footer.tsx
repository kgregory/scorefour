import type { ReactNode } from "react";
import { PLAYER_ONE } from "~/utils/constants";
import type { Player, Players } from "~/utils/types";
import { Circle } from "./Circle";

export type GameStatusState =
  | { type: "turn"; player: Player }
  | { type: "win"; player: Player }
  | { type: "draw" }
  | { type: "quit"; player: Player };

interface GameStatusProps {
  status: GameStatusState;
  playersPerDevice: Players;
}

const firstCap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const GameStatus = ({ status, playersPerDevice }: GameStatusProps) => {
  if (status.type === "draw") {
    return (
      <p className="text-2xl font-bold text-slate-700">It&apos;s a draw!</p>
    );
  }

  const isSelf = playersPerDevice === 1 && status.player === PLAYER_ONE;

  const message = (() => {
    switch (status.type) {
      case "turn":
        return firstCap(isSelf ? "your turn" : `${status.player}'s turn`);
      case "win":
        return firstCap(isSelf ? "you win!" : `${status.player} wins!`);
      case "quit":
        return firstCap(isSelf ? "you quit." : `${status.player} quit.`);
    }
  })();

  return (
    <div className="flex items-center gap-2 text-2xl font-bold text-slate-700">
      <Circle color={status.player} isEmphasized={false} isDense />
      <span>{message}</span>
    </div>
  );
};

interface FooterProps {
  status?: GameStatusState | null;
  playersPerDevice?: Players;
  children?: ReactNode;
}

export const Footer = ({
  status,
  playersPerDevice = 1,
  children,
}: FooterProps) => (
  <div className="flex flex-col items-center gap-3">
    {status != null ? (
      <GameStatus status={status} playersPerDevice={playersPerDevice} />
    ) : null}
    {children}
  </div>
);
