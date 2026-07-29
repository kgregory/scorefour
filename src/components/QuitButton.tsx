import { useState } from "react";
import {
  useCurrentPlayer,
  useSetScreen,
  useSetWasQuit,
} from "~/context/GameState";

export const QuitButton = () => {
  const setScreen = useSetScreen();
  const setWasQuit = useSetWasQuit();
  const currentPlayer = useCurrentPlayer();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <button
          onClick={() => {
            setWasQuit(currentPlayer);
            setScreen("ended");
          }}
          className="btn"
        >
          Quit
        </button>
        <button onClick={() => setConfirming(false)} className="btn">
          Keep playing
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="btn">
      Quit
    </button>
  );
};
