import { useEffect, useState } from "react";
import Head from "next/head";
import { ConnectedBoard } from "~/components/ConnectedBoard";
import { StartScreen } from "~/components/StartScreen";
import { EndScreen } from "~/components/EndScreen";
import { QuitButton } from "~/components/QuitButton";
import { useSinglePlayerOpponent } from "~/hooks/useSinglePlayerOpponent";
import { useResultReaction } from "~/hooks/useResultReaction";
import { useUpdateGameState } from "~/hooks/useUpdateGameState";
import { PLAYER_ONE, PLAYER_TWO, PLAYER_THREE, PLAYER_FOUR } from "~/utils/constants";
import type { Screen } from "~/utils/types";
import { Circle } from "~/components/Circle";
import {
  GameStateProvider,
  useCurrentPlayer,
  usePlayers,
  useScreen,
  useSetScreen,
  useStartGame,
  useWinner,
} from "~/context/GameState";

const Game = () => {
  const update = useUpdateGameState();
  const screen = useScreen();
  const setScreen = useSetScreen();
  const winner = useWinner();
  const currentPlayer = useCurrentPlayer();
  const players = usePlayers();
  const startGame = useStartGame();

  useResultReaction({ firstPlayer: PLAYER_ONE });

  useSinglePlayerOpponent({
    firstPlayer: PLAYER_ONE,
    secondPlayer: PLAYER_TWO,
    update,
  });

  // Transition to ended screen when the game concludes
  useEffect(() => {
    if (winner !== null && screen === "playing") {
      setScreen("ended");
    }
  }, [winner, screen, setScreen]);

  // Fade-transition between screens: fade out → swap content → fade in
  const [animating, setAnimating] = useState(false);
  const [displayedScreen, setDisplayedScreen] = useState<Screen>("start");

  useEffect(() => {
    if (screen === "ended") {
      setDisplayedScreen("ended");
      return;
    }
    setAnimating(true);
    const t = setTimeout(() => {
      setDisplayedScreen(screen);
      setAnimating(false);
    }, 200);
    return () => clearTimeout(t);
  }, [screen]);

  return (
    <div
      className={`transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}
    >
      {displayedScreen === "start" && <StartScreen onStart={startGame} />}
      {displayedScreen === "playing" && (
        <div className="flex flex-col items-center gap-8">
          <div className="container flex items-center justify-between px-4 pt-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-700">
              Score Four
            </h1>
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${players < 3 ? 2 : players}, 1fr)` }}
            >
              <Circle color={PLAYER_ONE} isDense />
              <Circle color={PLAYER_TWO} isDense />
              {players > 2 && <Circle color={PLAYER_THREE} isDense />}
              {players > 3 && <Circle color={PLAYER_FOUR} isDense />}
            </div>
          </div>
          <ConnectedBoard handleTurn={update} />
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-2xl font-bold text-slate-700">
              <Circle color={currentPlayer} isEmphasized={false} isDense />
              <span className="capitalize">It&apos;s {currentPlayer}&apos;s turn</span>
            </div>
            <QuitButton />
          </div>
        </div>
      )}
      {displayedScreen === "ended" && <EndScreen onPlayAgain={startGame} />}
    </div>
  );
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Score Four</title>
        <meta name="description" content="A fake board game called Score Four." />
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
