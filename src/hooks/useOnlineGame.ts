import { useCallback, useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";
import { env } from "~/env.js";
import type { Player, Players } from "~/utils/types";
import type { RoomState, ServerMessage } from "~/utils/partyTypes";
import {
  useGameMode,
  useRoomCode,
  useSetCurrentPlayer,
  useSetPlayers,
  useSetRows,
  useSetColumns,
  useSetScreen,
  useSetValues,
  useSetWasQuit,
  useSetWinner,
} from "~/context/GameState";

export interface OnlineGameState {
  localPlayer: Player | null;
  lobbyPlayers: Player[];
  opponentConnected: boolean;
  opponentLeft: boolean;
  errorMessage: string | null;
  dropPiece: (column: number) => void;
  quitOnline: () => void;
  resetOnline: () => void;
  startGame: () => void;
}

/** manages the partykit websocket connection for online multiplayer */
export const useOnlineGame = (): OnlineGameState => {
  const gameMode = useGameMode();
  const roomCode = useRoomCode();

  const setValues = useSetValues();
  const setCurrentPlayer = useSetCurrentPlayer();
  const setPlayers = useSetPlayers();
  const setWinner = useSetWinner();
  const setWasQuit = useSetWasQuit();
  const setScreen = useSetScreen();
  const setRows = useSetRows();
  const setColumns = useSetColumns();

  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [lobbyPlayers, setLobbyPlayers] = useState<Player[]>([]);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const socketRef = useRef<PartySocket | null>(null);
  const localPlayerRef = useRef<Player | null>(null);
  // Tracks whether this game session has reached an ended state so opponent_left
  // doesn't pull a player off the result screen with no explanation.
  const gameEndedRef = useRef(false);
  // Tracks whether we have ever received a welcome from this room. Used to
  // distinguish a reconnect race ("Room is full" because old socket not yet
  // cleaned up) from a genuine rejection (3rd person trying to join a full room).
  const hasConnectedRef = useRef(false);

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
    setLobbyPlayers([]);
    gameEndedRef.current = false;
    hasConnectedRef.current = false;

    const socket = new PartySocket({
      host: env.NEXT_PUBLIC_PARTYKIT_HOST,
      room: roomCode,
    });
    socketRef.current = socket;

    socket.addEventListener("message", (event: MessageEvent<string>) => {
      const msg = JSON.parse(event.data) as ServerMessage;

      if (msg.type === "welcome") {
        hasConnectedRef.current = true;
        setErrorMessage(null); // clear any stale error from a reconnect attempt
        localPlayerRef.current = msg.player;
        setLocalPlayer(msg.player);
        syncState(msg.roomState);
        setLobbyPlayers(msg.roomState.lobbyPlayers);
        if (msg.roomState.phase === "playing") {
          // Reconnect to an active game — transition straight to the board.
          setPlayers(msg.roomState.gamePlayers.length as Players);
          setScreen("playing");
        } else if (msg.roomState.phase === "ended") {
          // Stale room — server should have reset it, but handle defensively.
          setErrorMessage("This room is no longer available.");
          socket.close();
        }
        // phase === "lobby": already on the lobby screen; lobbyPlayers updated above
      }

      if (msg.type === "state_update") {
        syncState(msg.roomState);
        if (msg.roomState.phase === "lobby") {
          setLobbyPlayers(msg.roomState.lobbyPlayers);
        }
        if (msg.roomState.phase === "playing") {
          setLobbyPlayers([]);
          setPlayers(msg.roomState.gamePlayers.length as Players);
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
        // Only stop reconnecting for a genuine rejection (never successfully joined).
        // If we already had a welcome, the error is likely a reconnect race where the
        // old socket hasn't been cleaned up yet — let partysocket retry automatically.
        if (!hasConnectedRef.current) {
          socket.close();
        }
      }
    });

    return () => {
      socket.close();
      socketRef.current = null;
      localPlayerRef.current = null;
      setLocalPlayer(null);
      setLobbyPlayers([]);
      setOpponentConnected(false);
      // errorMessage and opponentLeft are intentionally NOT cleared here — they
      // persist until the next connection attempt so the user can read them.
      gameEndedRef.current = false;
    };
  }, [gameMode, roomCode, setPlayers, setScreen, setWasQuit, syncState]);

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

  const startGame = useCallback(() => {
    socketRef.current?.send(JSON.stringify({ type: "start_game" }));
  }, []);

  return {
    localPlayer,
    lobbyPlayers,
    opponentConnected,
    opponentLeft,
    errorMessage,
    dropPiece,
    quitOnline,
    resetOnline,
    startGame,
  };
};
