import { PLAYER_ONE, allPlayers } from "../src/utils/constants";
import { getLowestEmptyCell } from "../src/utils/getLowestEmptyCell";
import { checkCell } from "../src/utils/checkCell";
import type { Player, BoardValue } from "../src/utils/types";
import type {
  RoomState,
  ClientMessage,
  ServerMessage,
} from "../src/utils/partyTypes";

const DEFAULT_ROWS = 6;
const DEFAULT_COLUMNS = 7;

export interface Env {
  GAME_ROOM: DurableObjectNamespace;
}

// Worker entry point: routes WebSocket upgrades to the right Durable Object.
// partysocket v1.x connects to /parties/{name}/{room} (name defaults to "main").
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/parties\/[^/]+\/([^/]+)$/i);
    if (!match) return new Response("Not found", { status: 404 });
    const roomId = match[1]!.toUpperCase();
    const id = env.GAME_ROOM.idFromName(roomId);
    const stub = env.GAME_ROOM.get(id);
    return stub.fetch(request);
  },
};

const initialState = (): RoomState => ({
  values: Array<BoardValue>(DEFAULT_ROWS * DEFAULT_COLUMNS).fill(undefined),
  currentPlayer: PLAYER_ONE,
  winner: null,
  phase: "lobby",
  rows: DEFAULT_ROWS,
  columns: DEFAULT_COLUMNS,
  lobbyPlayers: [],
  gamePlayers: [],
});

export class GameRoom implements DurableObject {
  constructor(
    private readonly ctx: DurableObjectState,
    _env: Env,
  ) {}

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    // getWebSockets("player") returns only accepted, non-rejected connections.
    const existing = this.ctx.getWebSockets("player");
    const [client, server] = Object.values(new WebSocketPair()) as [
      WebSocket,
      WebSocket,
    ];

    if (existing.length >= 4) {
      // Accept briefly so we can send the error, then close.
      this.ctx.acceptWebSocket(server, ["rejected"]);
      server.send(
        JSON.stringify({
          type: "error",
          message: "Room is full",
        } as ServerMessage),
      );
      server.close(1008, "Room is full");
      return new Response(null, { status: 101, webSocket: client });
    }

    // Assign the first color from allPlayers not already taken by a connected socket.
    const takenColors = existing
      .map((ws) =>
        this.ctx
          .getTags(ws)
          .find((t): t is Player =>
            (allPlayers as readonly string[]).includes(t),
          ),
      )
      .filter((c): c is Player => c !== undefined);
    const player = allPlayers.find((p) => !takenColors.includes(p))!;

    this.ctx.acceptWebSocket(server, ["player", player]);

    let state = await this.getState();

    // First player into any non-lobby room: reset so they get a clean room.
    if (existing.length === 0 && state.phase !== "lobby") {
      state = initialState();
    }

    // Add this player to the lobby list (guard against duplicate on reconnect).
    const lobbyPlayers: Player[] = [
      ...state.lobbyPlayers.filter((p) => p !== player),
      player,
    ];
    state = { ...state, lobbyPlayers };
    await this.saveState(state);

    server.send(
      JSON.stringify({
        type: "welcome",
        player,
        roomState: state,
      } as ServerMessage),
    );

    // Notify existing players that someone joined.
    if (existing.length > 0) {
      this.broadcast({ type: "state_update", roomState: state }, [server]);
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string): Promise<void> {
    const player = this.getPlayer(ws);
    if (!player) return;

    const msg = JSON.parse(message) as ClientMessage;
    let state = await this.getState();

    if (msg.type === "start_game") {
      if (state.phase !== "lobby") return;
      if (state.lobbyPlayers.length < 2) return;
      if (player !== state.lobbyPlayers[0]) return; // only host may start
      state = {
        ...state,
        phase: "playing",
        gamePlayers: [...state.lobbyPlayers],
        values: Array<BoardValue>(state.rows * state.columns).fill(undefined),
        currentPlayer: state.lobbyPlayers[0]!,
        winner: null,
      };
      await this.saveState(state);
      this.broadcast({ type: "state_update", roomState: state });
      return;
    }

    if (msg.type === "drop_piece") {
      if (state.phase !== "playing" || state.winner != null) return;
      if (player !== state.currentPlayer) return;

      const { column } = msg;
      if (column < 0 || column >= state.columns) return;

      const cell = getLowestEmptyCell(column, state);
      if (cell == null) return;

      const newValues = [...state.values];
      newValues[cell] = player;

      const winningCells = Object.values(
        checkCell(cell, {
          columns: state.columns,
          rows: state.rows,
          values: newValues,
        }),
      )
        .filter((dir) => dir.length > 3)
        .flat();

      winningCells.forEach((i) => {
        newValues[i] = `${player}-win`;
      });

      let winner: RoomState["winner"] = state.winner;
      let nextPlayer: Player = state.currentPlayer;
      let phase: RoomState["phase"] = state.phase;

      if (winningCells.length > 0) {
        winner = player;
        phase = "ended";
      } else if (newValues.every((v) => v != null)) {
        winner = "draw";
        phase = "ended";
      } else {
        const idx = state.gamePlayers.indexOf(player);
        nextPlayer =
          state.gamePlayers[(idx + 1) % state.gamePlayers.length] ??
          state.gamePlayers[0]!;
      }

      state = {
        ...state,
        values: newValues,
        currentPlayer: nextPlayer,
        winner,
        phase,
      };
      await this.saveState(state);
      this.broadcast({ type: "state_update", roomState: state });
    }

    if (msg.type === "reset") {
      if (state.phase !== "ended") return;
      state = {
        ...state,
        values: Array<BoardValue>(state.rows * state.columns).fill(undefined),
        currentPlayer: state.gamePlayers[0] ?? PLAYER_ONE,
        winner: null,
        phase: "playing",
      };
      await this.saveState(state);
      this.broadcast({ type: "state_update", roomState: state });
    }

    if (msg.type === "quit") {
      if (state.phase === "ended") return;
      // Record who quit so webSocketClose doesn't double-fire opponent_left.
      await this.ctx.storage.put("quitPlayer", player);
      state = { ...state, phase: "ended" };
      await this.saveState(state);
      this.broadcast({ type: "opponent_quit", player }, [ws]);
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    if (this.ctx.getTags(ws).includes("rejected")) return;

    const player = this.getPlayer(ws);
    if (!player) return;

    const state = await this.getState();

    if (state.phase === "lobby") {
      const lobbyPlayers = state.lobbyPlayers.filter((p) => p !== player);
      const newState: RoomState =
        lobbyPlayers.length === 0
          ? initialState()
          : { ...state, lobbyPlayers };
      await this.saveState(newState);
      this.broadcast({ type: "state_update", roomState: newState }, [ws]);
      return;
    }

    const quitPlayer = await this.ctx.storage.get<Player>("quitPlayer");
    if (quitPlayer === player) {
      await this.ctx.storage.delete("quitPlayer");
      return;
    }

    this.broadcast({ type: "opponent_left", player }, [ws]);
  }

  private getPlayer(ws: WebSocket): Player | undefined {
    return this.ctx
      .getTags(ws)
      .find((t): t is Player => t === "red" || t === "yellow" || t === "purple" || t === "green");
  }

  private broadcast(msg: ServerMessage, exclude: WebSocket[] = []): void {
    const data = JSON.stringify(msg);
    for (const ws of this.ctx.getWebSockets("player")) {
      if (!exclude.includes(ws)) ws.send(data);
    }
  }

  private async getState(): Promise<RoomState> {
    return (await this.ctx.storage.get<RoomState>("state")) ?? initialState();
  }

  private async saveState(state: RoomState): Promise<void> {
    await this.ctx.storage.put("state", state);
  }
}
