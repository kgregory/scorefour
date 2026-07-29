import { useState, useEffect } from "react";
import { useSetRoomCode } from "~/context/GameState";

const UNAMBIGUOUS = "ACDEFGHJKMNPQRTUVWXYZ23456789";

const generateRoomCode = () =>
  Array.from({ length: 6 }, () =>
    UNAMBIGUOUS[Math.floor(Math.random() * UNAMBIGUOUS.length)],
  ).join("");

type LobbyView = "choose" | "creating" | "joining";

interface LobbyScreenProps {
  opponentConnected: boolean;
  onBack: () => void;
  initialRoomCode?: string | null;
  errorMessage?: string | null;
}

export const LobbyScreen = ({ opponentConnected, onBack, initialRoomCode, errorMessage }: LobbyScreenProps) => {
  const setRoomCode = useSetRoomCode();

  const [view, setView] = useState<LobbyView>(initialRoomCode ? "joining" : "choose");
  const [code, setCode] = useState(initialRoomCode ?? "");
  const [joinInput, setJoinInput] = useState(initialRoomCode ?? "");
  const [copied, setCopied] = useState(false);

  // Auto-connect once on mount when arriving via a shared link.
  // Empty deps is intentional: initialRoomCode is a one-time seed from the URL
  // (already cleared from the query string) and setRoomCode is a stable dispatch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (initialRoomCode) setRoomCode(initialRoomCode);
  }, []);

  const handleCreate = () => {
    const newCode = generateRoomCode();
    setCode(newCode);
    setRoomCode(newCode);
    setView("creating");
  };

  const handleJoin = () => {
    const trimmed = joinInput.trim().toUpperCase();
    if (trimmed.length < 6) return;
    setCode(trimmed);
    setRoomCode(trimmed);
    setView("joining");
  };

  const handleBack = () => {
    setRoomCode(null);
    setCode("");
    setJoinInput("");
    setView("choose");
    onBack();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${code}`;
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="container px-4 pt-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-700">
          Score Four
        </h1>
      </div>

      {view === "choose" && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg font-semibold text-slate-600">Online Game</p>
          <div className="flex gap-4">
            <button
              onClick={handleCreate}
              className="rounded bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700"
            >
              Create Game
            </button>
            <button
              onClick={() => setView("joining")}
              className="rounded bg-slate-200 px-6 py-3 font-semibold text-slate-700 shadow hover:bg-slate-300"
            >
              Join Game
            </button>
          </div>
          <button
            onClick={handleBack}
            className="mt-2 text-sm text-slate-500 underline hover:text-slate-700"
          >
            ← Back
          </button>
        </div>
      )}

      {view === "creating" && (
        <div className="flex flex-col items-center gap-6">
          <p className="text-lg font-semibold text-slate-600">
            Share this code with your opponent:
          </p>
          <div className="rounded-xl bg-slate-100 px-8 py-4 text-4xl font-extrabold tracking-widest text-slate-800 shadow-inner">
            {code}
          </div>
          <button
            onClick={handleCopyLink}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
          {opponentConnected ? (
            <p className="font-semibold text-green-600">Opponent connected! Starting...</p>
          ) : (
            <p className="animate-pulse text-slate-500">Waiting for opponent...</p>
          )}
          <button
            onClick={handleBack}
            className="mt-2 text-sm text-slate-500 underline hover:text-slate-700"
          >
            ← Cancel
          </button>
        </div>
      )}

      {view === "joining" && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg font-semibold text-slate-600">Enter the room code:</p>
          <input
            type="text"
            value={joinInput}
            onChange={(e) => {
              setJoinInput(e.target.value.toUpperCase());
              if (code !== "") { setCode(""); setRoomCode(null); }
            }}
            onKeyDown={(e) => { if (e.key === "Enter") handleJoin(); }}
            maxLength={6}
            placeholder="ABC123"
            className="rounded border border-slate-300 px-4 py-2 text-center text-2xl font-bold uppercase tracking-widest shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
          <button
            onClick={handleJoin}
            disabled={joinInput.trim().length < 6}
            className="rounded bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-40"
          >
            Join
          </button>
          {errorMessage ? (
            <p className="text-sm font-medium text-red-600">{errorMessage}</p>
          ) : code !== "" && (
            opponentConnected ? (
              <p className="font-semibold text-green-600">Connected! Starting...</p>
            ) : (
              <p className="animate-pulse text-slate-500">Connecting...</p>
            )
          )}
          <button
            onClick={handleBack}
            className="mt-2 text-sm text-slate-500 underline hover:text-slate-700"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
};
