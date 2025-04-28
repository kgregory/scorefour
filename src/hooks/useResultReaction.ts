import confetti from "canvas-confetti";
import { useEffect } from "react";
import { usePlayers, useWinner } from "~/context/GameState";

interface UseResultReactionParams {
  firstPlayer: string;
}

/** canvas-confetti uses OffscreenCanvas, we'll skip it if it's not supported */
const isOffscreenCanvasSupported = typeof OffscreenCanvas !== "undefined";

const happyShapes = isOffscreenCanvasSupported
  ? ["🥳", "😸", "🤩", "🕺", "🎉"].map((text) =>
      confetti.shapeFromText({ text, scalar: 15 }),
    )
  : undefined;

const sadShapes = isOffscreenCanvasSupported
  ? ["😢", "😩", "😧", "😖", "🤬"].map((text) =>
      confetti.shapeFromText({ text, scalar: 15 }),
    )
  : undefined;

const drawShapes = isOffscreenCanvasSupported
  ? ["👔", "🙈", "🙅", "😑", "😐"].map((text) =>
      confetti.shapeFromText({ text, scalar: 15 }),
    )
  : undefined;

/** display a single shape that slowly falls and fades */
const showEmojiConfetti = (shapes: confetti.Shape[]) => {
  confetti({
    spread: 0,
    gravity: 0.65,
    decay: 0.96,
    startVelocity: 15,
    scalar: 10,
    particleCount: 1,
    flat: true,
    disableForReducedMotion: true,
    shapes,
  })?.catch(() => {
    // ignore confetti-related errors
  });
};

/** handle the animated reaction that occurs when the game is over */
export const useResultReaction = (params: UseResultReactionParams) => {
  const { firstPlayer } = params;

  const players = usePlayers();
  const winner = useWinner();

  const isDraw = winner === "draw";
  const isVictorious = !isDraw && winner != null;
  const isMultiplayer = players > 1;
  const isHuman = isMultiplayer || (!isMultiplayer && winner === firstPlayer);
  const isJoyous = isVictorious && isHuman;
  const isDismal = isVictorious && !isHuman;

  useEffect(() => {
    if (isJoyous && happyShapes != null) {
      // emoji and confetti for the winner
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        disableForReducedMotion: true,
      })?.catch(() => {
        // ignore confetti-related errors
      });
      showEmojiConfetti(happyShapes);
    } else if (isDraw && drawShapes != null) {
      showEmojiConfetti(drawShapes);
    } else if (isDismal && sadShapes != null) {
      showEmojiConfetti(sadShapes);
    }
  }, [isDismal, isDraw, isJoyous]);
};
