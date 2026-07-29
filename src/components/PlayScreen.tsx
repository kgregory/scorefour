interface PlayScreenProps {
  onLocal: () => void;
  onOnline: () => void;
  onBack: () => void;
}

export const PlayScreen = ({ onLocal, onOnline, onBack }: PlayScreenProps) => (
  <div className="flex flex-col items-center gap-8">
    <div className="container px-4 pt-8">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-700">Score Four</h1>
    </div>
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg font-semibold text-slate-600">How do you want to play?</p>
      <div className="flex gap-4">
        <button
          onClick={onLocal}
          className="rounded bg-blue-600 px-8 py-3 font-semibold text-white shadow hover:bg-blue-700"
        >
          Local
        </button>
        <button
          onClick={onOnline}
          className="rounded border border-blue-600 px-8 py-3 font-semibold text-blue-600 shadow hover:bg-blue-50"
        >
          Online
        </button>
      </div>
    </div>
    <button
      onClick={onBack}
      className="text-sm text-slate-500 underline hover:text-slate-700"
    >
      ← Back
    </button>
  </div>
);
