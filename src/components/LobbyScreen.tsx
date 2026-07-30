import { useState, useEffect } from "react";
import { useSetRoomCode } from "~/context/GameState";
import { Circle } from "~/components/Circle";
import type { Player } from "~/utils/types";

const UNAMBIGUOUS = "ACDEFGHJKMNPQRTUVWXYZ23456789";

const generateRoomCode = () =>
  Array.from(
    { length: 6 },
    () => UNAMBIGUOUS[Math.floor(Math.random() * UNAMBIGUOUS.length)],
  ).join("");

type LobbyView = "choose" | "creating" | "joining";

interface LobbyScreenProps {
  lobbyPlayers: Player[];
  localPlayer: Player | null;
  onStartGame: () => void;
  onBack: () => void;
  initialRoomCode?: string | null;
  errorMessage?: string | null;
}

const PlayerList = ({
  lobbyPlayers,
  localPlayer,
}: {
  lobbyPlayers: Player[];
  localPlayer: Player | null;
}) => (
  <div className="flex flex-col gap-2">
    {lobbyPlayers.map((color, i) => (
      <div key={color} className="flex items-center gap-2">
        <Circle color={color} isEmphasized={false} isDense />
        <span className="capitalize font-medium text-slate-700">{color}</span>
        <span className="text-xs text-slate-400">
          {i === 0 && color === localPlayer
            ? "(you · host)"
            : i === 0
              ? "host"
              : color === localPlayer
                ? "(you)"
                : ""}
        </span>
      </div>
    ))}
  </div>
);

export const LobbyScreen = ({
  lobbyPlayers,
  localPlayer,
  onStartGame,
  onBack,
  initialRoomCode,
  errorMessage,
}: LobbyScreenProps) => {
  const setRoomCode = useSetRoomCode();

  const [view, setView] = useState<LobbyView>(
    initialRoomCode ? "joining" : "choose",
  );
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

  const isHost = localPlayer !== null && localPlayer === lobbyPlayers[0];
  const canStart = lobbyPlayers.length >= 2;

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
            Share this code with friends:
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

          {localPlayer !== null ? (
            <>
              <PlayerList lobbyPlayers={lobbyPlayers} localPlayer={localPlayer} />
              {lobbyPlayers.length < 4 && (
                <p className="animate-pulse text-sm text-slate-500">
                  {canStart
                    ? "Waiting for more players… (up to 4)"
                    : "Waiting for players to join…"}
                </p>
              )}
              <button
                onClick={onStartGame}
                disabled={!canStart}
                className="rounded bg-blue-600 px-8 py-3 font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-40"
              >
                Start Game
              </button>
            </>
          ) : (
            <p className="animate-pulse text-slate-500">Connecting…</p>
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
          {localPlayer === null ? (
            <>
              <p className="text-lg font-semibold text-slate-600">
                Enter the room code:
              </p>
              <input
                type="text"
                value={joinInput}
                onChange={(e) => {
                  setJoinInput(e.target.value.toUpperCase());
                  if (code !== "") {
                    setCode("");
                    setRoomCode(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleJoin();
                }}
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
                <p className="text-sm font-medium text-red-600">
                  {errorMessage}
                </p>
              ) : (
                code !== "" && (
                  <p className="animate-pulse text-slate-500">Connecting…</p>
                )
              )}
            </>
          ) : (
            <>
              <PlayerList lobbyPlayers={lobbyPlayers} localPlayer={localPlayer} />
              {errorMessage ? (
                <p className="text-sm font-medium text-red-600">
                  {errorMessage}
                </p>
              ) : isHost ? (
                <>
                  {lobbyPlayers.length < 4 && (
                    <p className="animate-pulse text-sm text-slate-500">
                      {canStart
                        ? "Waiting for more players… (up to 4)"
                        : "Waiting for players to join…"}
                    </p>
                  )}
                  <button
                    onClick={onStartGame}
                    disabled={!canStart}
                    className="rounded bg-blue-600 px-8 py-3 font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-40"
                  >
                    Start Game
                  </button>
                </>
              ) : (
                <p className="animate-pulse text-slate-500">
                  Waiting for host to start…
                </p>
              )}
            </>
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
