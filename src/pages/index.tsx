import Head from "next/head";
import { Board } from "~/components/Board";
import { GameSettings } from "~/components/GameSettings";
import { GameStatus } from "~/components/GameStatus";
import { useSinglePlayerOpponent } from "~/hooks/useSinglePlayerOpponent";
import { useResultReaction } from "~/hooks/useResultReaction";
import { useUpdateGameState } from "~/hooks/useUpdateGameState";
import { PLAYER_ONE, PLAYER_TWO } from "~/utils/constants";
import { GameStateProvider } from "~/context/GameState";

const Game = () => {
  const update = useUpdateGameState();

  useResultReaction({ firstPlayer: PLAYER_ONE });

  useSinglePlayerOpponent({
    firstPlayer: PLAYER_ONE,
    secondPlayer: PLAYER_TWO,
    update,
  });

  return (
    <div className="flex flex-col items-center gap-8">
      <GameStatus />
      <Board handleTurn={update} />
      <GameSettings />
    </div>
  );
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Score Four</title>
        <meta
          name="description"
          content="A fake board game called Score Four."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-white to-gray-100">
        <GameStateProvider>
          <Game />
        </GameStateProvider>
      </main>
    </>
  );
}
