import { useCallback, useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";
import { env } from "~/env.js";
import type { Player } from "~/utils/types";
import type { RoomState, ServerMessage } from "~/utils/partyTypes";
import {
  useGameMode,
  useRoomCode,
  useSetCurrentPlayer,
  useSetRows,
  useSetColumns,
  useSetScreen,
  useSetValues,
  useSetWasQuit,
  useSetWinner,
} from "~/context/GameState";

export interface OnlineGameState {
  localPlayer: Player | null;
  opponentConnected: boolean;
  opponentLeft: boolean;
  errorMessage: string | null;
  dropPiece: (column: number) => void;
  quitOnline: () => void;
  resetOnline: () => void;
}

/** manages the partykit websocket connection for online multiplayer */
export const useOnlineGame = (): OnlineGameState => {
  const gameMode = useGameMode();
  const roomCode = useRoomCode();

  const setValues = useSetValues();
  const setCurrentPlayer = useSetCurrentPlayer();
  const setWinner = useSetWinner();
  const setWasQuit = useSetWasQuit();
  const setScreen = useSetScreen();
  const setRows = useSetRows();
  const setColumns = useSetColumns();

  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const socketRef = useRef<PartySocket | null>(null);
  // Tracks whether this game session has reached an ended state so opponent_left
  // doesn't pull a player off the result screen with no explanation.
  const gameEndedRef = useRef(false);

  const syncState = useCallback(
    (state: RoomState) => {
      setRows(state.rows);
      setColumns(state.columns);
      setValues(state.values);
      setCurrentPlayer(state.currentPlayer);
      setWinner(state.winner);
    },
    [setColumns, setCurrentPlayer, setRows, setValues, setWinner],
  );

  useEffect(() => {
    if (gameMode !== "online" || roomCode === null) return;

    // Clear stale state from any previous session before opening a new connection.
    setErrorMessage(null);
    setOpponentLeft(false);
    gameEndedRef.current = false;

    const socket = new PartySocket({
      host: env.NEXT_PUBLIC_PARTYKIT_HOST,
      room: roomCode,
    });
    socketRef.current = socket;

    socket.addEventListener("message", (event: MessageEvent<string>) => {
      const msg = JSON.parse(event.data) as ServerMessage;

      if (msg.type === "welcome") {
        setLocalPlayer(msg.player);
        syncState(msg.roomState);
        if (msg.roomState.phase === "playing") {
          // Reconnect to an active room — opponent is already present.
          setScreen("playing");
        } else if (msg.roomState.phase === "ended") {
          // Stale room — server should have reset it, but handle defensively.
          setErrorMessage("This room is no longer available.");
          socket.close();
        }
      }

      if (msg.type === "state_update") {
        syncState(msg.roomState);
        if (msg.roomState.phase === "playing") {
          gameEndedRef.current = false;
          setWasQuit(null); // new game started — clear any previous quit state
          setOpponentConnected(true);
          setScreen("playing");
        }
        if (msg.roomState.phase === "ended") {
          gameEndedRef.current = true;
          setScreen("ended");
        }
      }

      if (msg.type === "opponent_quit") {
        gameEndedRef.current = true;
        setOpponentConnected(false);
        setWasQuit(msg.player);
        setScreen("ended");
      }

      if (msg.type === "opponent_left") {
        setOpponentConnected(false);
        if (!gameEndedRef.current) {
          // Mid-game disconnect: treat as a quit so the player gets context
          // instead of a silent jump to start.
          gameEndedRef.current = true;
          setWasQuit(msg.player);
          setScreen("ended");
        } else {
          // Post-game departure: stay on the result screen and surface the note
          // so the player knows why Play Again disappeared.
          setOpponentLeft(true);
        }
      }

      if (msg.type === "error") {
        setErrorMessage(msg.message);
        // Calling close() on the client prevents partysocket's auto-reconnect loop.
        socket.close();
      }
    });

    return () => {
      socket.close();
      socketRef.current = null;
      setLocalPlayer(null);
      setOpponentConnected(false);
      // errorMessage and opponentLeft are intentionally NOT cleared here — they
      // persist until the next connection attempt so the user can read them.
      gameEndedRef.current = false;
    };
  }, [gameMode, roomCode, setScreen, setWasQuit, syncState]);

  const dropPiece = useCallback((column: number) => {
    socketRef.current?.send(JSON.stringify({ type: "drop_piece", column }));
  }, []);

  const quitOnline = useCallback(() => {
    const s = socketRef.current;
    if (!s) return;
    // Send quit then close immediately — WebSocket guarantees in-order delivery,
    // so the server processes "quit" before the CLOSE frame arrives.
    s.send(JSON.stringify({ type: "quit" }));
    s.close();
    socketRef.current = null;
  }, []);

  const resetOnline = useCallback(() => {
    socketRef.current?.send(JSON.stringify({ type: "reset" }));
  }, []);

  return { localPlayer, opponentConnected, opponentLeft, errorMessage, dropPiece, quitOnline, resetOnline };
};
