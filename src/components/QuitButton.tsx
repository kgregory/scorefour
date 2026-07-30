import { useState } from "react";

interface QuitButtonProps {
  onQuit: () => void;
}

export const QuitButton = ({ onQuit }: QuitButtonProps) => {
  const [confirming, setConfirming] = useState(false);
  const toggleConfirming = () => setConfirming((v) => !v);

  return (
    <div className="flex flex-col items-center gap-3">
      <button onClick={toggleConfirming}>
        Quit {confirming ? " -" : " +"}
      </button>
      {confirming && (
        <div className="flex flex-col items-center gap-2 text-xs text-slate-400">
          <button className="hover:text-slate-600" onClick={onQuit}>
            Quit Game
          </button>
          <button className="hover:text-slate-600" onClick={toggleConfirming}>
            Keep Playing
          </button>
        </div>
      )}
    </div>
  );
};
