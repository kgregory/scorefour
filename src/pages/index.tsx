import { useEffect, useLayoutEffect, useState } from "react";
import Head from "next/head";
import { StartScreen } from "~/components/StartScreen";
import { PlayingScreen } from "~/components/PlayingScreen";
import { EndScreen } from "~/components/EndScreen";
import type { Screen } from "~/utils/types";
import {
  GameStateProvider,
  useScreen,
  useSetScreen,
  useStartGame,
  useWinner,
} from "~/context/GameState";

const Game = () => {
  const screen = useScreen();
  const setScreen = useSetScreen();
  const winner = useWinner();
  const startGame = useStartGame();

  // Transition to ended screen when the game concludes
  useEffect(() => {
    if (winner !== null && screen === "playing") {
      setScreen("ended");
    }
  }, [winner, screen, setScreen]);

  // Fade-transition between screens: fade out → swap content → fade in
  const [pendingScreen, setPendingScreen] = useState<Screen>("start");

  // Sync pendingScreen before paint when screen becomes "ended" so the subsequent
  // Play Again transition has a non-matching value to animate away from.
  useLayoutEffect(() => {
    if (screen !== "ended") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingScreen("ended");
  }, [screen]);

  useEffect(() => {
    if (screen === "ended") return;
    const t = setTimeout(() => {
      setPendingScreen(screen);
    }, 200);
    return () => clearTimeout(t);
  }, [screen]);

  const animating = screen !== pendingScreen;

  return (
    <div
      className={`transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}
    >
      {pendingScreen === "start" && <StartScreen onStart={startGame} />}
      {pendingScreen === "playing" && <PlayingScreen />}
      {pendingScreen === "ended" && <EndScreen onPlayAgain={startGame} />}
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
      <main className="flex min-h-screen flex-col items-center justify-start bg-linear-to-b from-white to-gray-100">
        <GameStateProvider>
          <Game />
        </GameStateProvider>
      </main>
    </>
  );
}
