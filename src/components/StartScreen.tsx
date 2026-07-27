import { DecorativeBoard } from "./DecorativeBoard";
import { GameSettings } from "./GameSettings";

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => (
  <div className="flex flex-col items-center gap-8">
    <div className="container flex items-center justify-between px-4 pt-8">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-700">
        Score Four
      </h1>
      <button
        onClick={onStart}
        className="rounded bg-blue-600 px-6 py-2 font-semibold text-white shadow hover:bg-blue-700"
      >
        Start Game
      </button>
    </div>
    <DecorativeBoard />
    <div className="flex flex-col items-center gap-3">
      <GameSettings />
    </div>
  </div>
);
