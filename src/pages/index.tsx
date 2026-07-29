import { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ConnectedBoard } from "~/components/ConnectedBoard";
import { StartScreen } from "~/components/StartScreen";
import { PlayScreen } from "~/components/PlayScreen";
import { LocalPlayScreen } from "~/components/LocalPlayScreen";
import { EndScreen } from "~/components/EndScreen";
import { LobbyScreen } from "~/components/LobbyScreen";
import { QuitButton } from "~/components/QuitButton";
import { useSinglePlayerOpponent } from "~/hooks/useSinglePlayerOpponent";
import { useResultReaction } from "~/hooks/useResultReaction";
import { useUpdateGameState } from "~/hooks/useUpdateGameState";
import { useOnlineGame } from "~/hooks/useOnlineGame";
import {
  PLAYER_ONE,
  PLAYER_TWO,
  PLAYER_THREE,
  PLAYER_FOUR,
} from "~/utils/constants";
import type { Screen } from "~/utils/types";
import { Circle } from "~/components/Circle";
import {
  GameStateProvider,
  useCurrentPlayer,
  useGameMode,
  usePlayers,
  useScreen,
  useSetGameMode,
  useSetPlayers,
  useSetRoomCode,
  useSetScreen,
  useSetWasQuit,
  useSetWinner,
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
  const baseStartGame = useStartGame();
  const gameMode = useGameMode();
  const setGameMode = useSetGameMode();
  const setPlayers = useSetPlayers();
  const setRoomCode = useSetRoomCode();
  const setWinner = useSetWinner();
  const setWasQuit = useSetWasQuit();
  const router = useRouter();
  const [urlRoomCode, setUrlRoomCode] = useState<string | null>(null);
  const checkedUrlRef = useRef(false);

  const {
    localPlayer,
    opponentConnected,
    opponentLeft,
    errorMessage,
    dropPiece,
    quitOnline,
    resetOnline,
  } = useOnlineGame();

  useResultReaction({
    firstPlayer: PLAYER_ONE,
    localPlayer: gameMode === "online" ? localPlayer : undefined,
  });

  useSinglePlayerOpponent({
    firstPlayer: PLAYER_ONE,
    secondPlayer: PLAYER_TWO,
    update,
  });

  // Transition to ended screen when a local game concludes
  useEffect(() => {
    if (gameMode === "online") return;
    if (winner !== null && screen === "playing") {
      setScreen("ended");
    }
  }, [winner, screen, setScreen, gameMode]);

  // On first router-ready tick, check for a room code shared via link
  useEffect(() => {
    if (checkedUrlRef.current || !router.isReady) return;
    checkedUrlRef.current = true;
    const room =
      typeof router.query.room === "string"
        ? router.query.room.trim().toUpperCase()
        : null;
    if (room && room.length >= 6) {
      setUrlRoomCode(room);
      setGameMode("online");
      setPlayers(2);
      setScreen("online-play");
      void router.replace(router.pathname, undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const handlePlay = useCallback(() => setScreen("play"), [setScreen]);
  const handleBackToStart = useCallback(() => setScreen("start"), [setScreen]);
  const handleBackFromLocalPlay = useCallback(
    () => setScreen("play"),
    [setScreen],
  );
  const handleBackFromOnlineLobby = useCallback(() => {
    setUrlRoomCode(null);
    setGameMode("local");
    setScreen("play");
  }, [setGameMode, setScreen]);

  const handlePlayLocal = useCallback(
    () => setScreen("local-play"),
    [setScreen],
  );

  const handlePlayOnline = useCallback(() => {
    setUrlRoomCode(null);
    setGameMode("online");
    setPlayers(2);
    setScreen("online-play");
  }, [setGameMode, setPlayers, setScreen]);

  // Resets to a clean local game and jumps straight to the playing screen.
  const startGame = useCallback(() => {
    setGameMode("local");
    setRoomCode(null);
    baseStartGame();
  }, [baseStartGame, setGameMode, setRoomCode]);

  // Leave an already-ended online game — no quit message needed, just clean up.
  // winner/wasQuit must be cleared before gameMode changes so useResultReaction
  // doesn't re-fire when localPlayer drops to undefined.
  const handleQuitOnline = useCallback(() => {
    setWinner(null);
    setWasQuit(null);
    setGameMode("local");
    setRoomCode(null);
    setScreen("start");
  }, [setGameMode, setRoomCode, setScreen, setWasQuit, setWinner]);

  const handleQuit = useCallback(() => {
    if (gameMode === "online") {
      // quitOnline() sends the quit message and closes the socket immediately.
      // The quitting player navigates directly to start — they know they quit.
      // The opponent receives opponent_quit and lands on the End screen.
      // React 18 batches all setters here into one render, so the fade starts
      // with gameMode already "local" and opacity-0 — no intermediate flash.
      quitOnline();
      setGameMode("local");
      setRoomCode(null);
      setScreen("start");
    }
  }, [gameMode, quitOnline, setGameMode, setRoomCode, setScreen]);

  // Fade-transition between screens: fade out → swap content → fade in
  const [animating, setAnimating] = useState(false);
  const [displayedScreen, setDisplayedScreen] = useState<Screen>("start");

  useEffect(() => {
    if (screen === "ended") {
      setAnimating(false);
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

  const isYourTurn = gameMode !== "online" || currentPlayer === localPlayer;
  const handleTurn = gameMode === "online" ? dropPiece : update;
  const handlePlayAgain = gameMode === "online" ? resetOnline : startGame;

  return (
    <div
      className={`transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}
    >
      {displayedScreen === "start" && <StartScreen onPlay={handlePlay} />}
      {displayedScreen === "play" && (
        <PlayScreen
          onLocal={handlePlayLocal}
          onOnline={handlePlayOnline}
          onBack={handleBackToStart}
        />
      )}
      {displayedScreen === "local-play" && (
        <LocalPlayScreen onStart={startGame} onBack={handleBackFromLocalPlay} />
      )}
      {displayedScreen === "online-play" && (
        <LobbyScreen
          opponentConnected={opponentConnected}
          onBack={handleBackFromOnlineLobby}
          initialRoomCode={urlRoomCode}
          errorMessage={errorMessage}
        />
      )}
      {displayedScreen === "playing" && (
        <div className="flex flex-col items-center gap-8">
          <div className="container flex items-center justify-between px-4 pt-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-700">
              Score Four
            </h1>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${players < 3 ? 2 : players}, 1fr)`,
              }}
            >
              <Circle color={PLAYER_ONE} isDense />
              <Circle color={PLAYER_TWO} isDense />
              {players > 2 && <Circle color={PLAYER_THREE} isDense />}
              {players > 3 && <Circle color={PLAYER_FOUR} isDense />}
            </div>
          </div>
          <ConnectedBoard handleTurn={isYourTurn ? handleTurn : undefined} />
          <div className="flex flex-col items-center gap-3">
            {screen === "playing" && (
              <div className="flex items-center gap-2 text-2xl font-bold text-slate-700">
                <Circle color={currentPlayer} isEmphasized={false} isDense />
                {gameMode === "online" ? (
                  isYourTurn ? (
                    <span>Your turn</span>
                  ) : (
                    <span className="text-slate-400">Opponent&apos;s turn</span>
                  )
                ) : (
                  <span>
                    It&apos;s{" "}
                    <span className="capitalize">{currentPlayer}</span>
                    &apos;s turn
                  </span>
                )}
              </div>
            )}
            {gameMode === "online" ? (
              <button
                onClick={handleQuit}
                className="text-sm text-slate-500 underline hover:text-slate-700"
              >
                Quit
              </button>
            ) : (
              <QuitButton />
            )}
          </div>
        </div>
      )}
      {displayedScreen === "ended" && (
        <EndScreen
          onPlayAgain={handlePlayAgain}
          onBack={handleBackToStart}
          onQuitOnline={handleQuitOnline}
          opponentConnected={opponentConnected}
          opponentLeft={opponentLeft}
          localPlayer={localPlayer}
        />
      )}
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
