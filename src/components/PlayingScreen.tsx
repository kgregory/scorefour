import { PLAYER_ONE, PLAYER_TWO } from "~/utils/constants";
import {
  useCurrentPlayer,
  usePlayers,
  useSetScreen,
  useSetWasQuit,
} from "~/context/GameState";
import { useUpdateGameState } from "~/hooks/useUpdateGameState";
import { useSinglePlayerOpponent } from "~/hooks/useSinglePlayerOpponent";
import { useResultReaction } from "~/hooks/useResultReaction";
import { Circle } from "./Circle";
import { ConnectedBoard } from "./ConnectedBoard";
import { Heading } from "./Heading";
import { PlayerChips } from "./PlayerChips";
import { QuitButton } from "./QuitButton";

export const PlayingScreen = () => {
  const update = useUpdateGameState();
  const players = usePlayers();
  const currentPlayer = useCurrentPlayer();
  const setScreen = useSetScreen();
  const setWasQuit = useSetWasQuit();

  useResultReaction({ firstPlayer: PLAYER_ONE });

  useSinglePlayerOpponent({
    firstPlayer: PLAYER_ONE,
    secondPlayer: PLAYER_TWO,
    update,
  });

  return (
    <div className="flex flex-col items-center gap-8">
      <Heading>
        <PlayerChips players={players} currentPlayer={currentPlayer} />
      </Heading>
      <ConnectedBoard handleTurn={update} />
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-2xl font-bold text-slate-700">
          <Circle color={currentPlayer} isEmphasized={false} isDense />
          <span className="capitalize">
            It&apos;s {currentPlayer}&apos;s turn
          </span>
        </div>
        <QuitButton
          onQuit={() => {
            setWasQuit(currentPlayer);
            setScreen("ended");
          }}
        />
      </div>
    </div>
  );
};
