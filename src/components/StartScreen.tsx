import { DecorativeBoard } from "./DecorativeBoard";

interface StartScreenProps {
  onPlay: () => void;
}

export const StartScreen = ({ onPlay }: StartScreenProps) => (
  <div className="flex flex-col items-center gap-8">
    <div className="container px-4 pt-8">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-700">Score Four</h1>
    </div>
    <DecorativeBoard />
    <button
      onClick={onPlay}
      className="rounded bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow hover:bg-blue-700"
    >
      Play Now
    </button>
  </div>
);
