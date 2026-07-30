import { PLAYER_ONE, PLAYER_TWO } from "~/utils/constants";
import {
  useColumns,
  useCurrentPlayer,
  usePlayers,
  useRows,
  useSetScreen,
  useSetWasQuit,
  useValues,
} from "~/context/GameState";
import { useDebouncedInteraction } from "~/hooks/useDebouncedInteraction";
import { useUpdateGameState } from "~/hooks/useUpdateGameState";
import { useSinglePlayerOpponent } from "~/hooks/useSinglePlayerOpponent";
import { useResultReaction } from "~/hooks/useResultReaction";
import { Board } from "./Board";
import { Footer } from "./Footer";
import { Heading } from "./Heading";
import { PlayerChips } from "./PlayerChips";
import { QuitButton } from "./QuitButton";

const ConnectedBoard = ({
  handleTurn,
}: {
  handleTurn: (column: number) => void;
}) => {
  const columns = useColumns();
  const rows = useRows();
  const values = useValues();
  const canClick = useDebouncedInteraction();

  return (
    <Board
      values={values}
      columns={columns}
      rows={rows}
      onCellClick={(column) => {
        if (canClick()) handleTurn(column);
      }}
    />
  );
};

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
      <Footer
        status={{ type: "turn", player: currentPlayer }}
        playersPerDevice={players}
      >
        <QuitButton
          onQuit={() => {
            setWasQuit(currentPlayer);
            setScreen("ended");
          }}
        />
      </Footer>
    </div>
  );
};
