import { GameSettings } from "./GameSettings";

interface LocalPlayScreenProps {
  onStart: () => void;
  onBack: () => void;
}

export const LocalPlayScreen = ({ onStart, onBack }: LocalPlayScreenProps) => (
  <div className="flex flex-col items-center gap-8">
    <div className="container px-4 pt-8">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-700">Score Four</h1>
    </div>
    <GameSettings />
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onStart}
        className="rounded bg-blue-600 px-8 py-3 font-semibold text-white shadow hover:bg-blue-700"
      >
        Start Game
      </button>
      <button
        onClick={onBack}
        className="text-sm text-slate-500 underline hover:text-slate-700"
      >
        ← Back
      </button>
    </div>
  </div>
);
