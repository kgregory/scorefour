import { PLAYER_ONE, PLAYER_TWO, allPlayers } from "../src/utils/constants";
import { getLowestEmptyCell } from "../src/utils/getLowestEmptyCell";
import { checkCell } from "../src/utils/checkCell";
import type { Player, BoardValue } from "../src/utils/types";
import type { RoomState, ClientMessage, ServerMessage } from "../src/utils/partyTypes";

const DEFAULT_ROWS = 6;
const DEFAULT_COLUMNS = 7;

export interface Env {
  GAME_ROOM: DurableObjectNamespace;
}

// Worker entry point: routes /party/{room} WebSocket upgrades to the right Durable Object.
// partysocket connects to {host}/party/{room} by default, so this path matches.
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/party\/([^/]+)$/i);
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
  phase: "waiting",
  rows: DEFAULT_ROWS,
  columns: DEFAULT_COLUMNS,
});

export class GameRoom implements DurableObject {
  constructor(private readonly ctx: DurableObjectState, private readonly env: Env) {}

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    // getWebSockets("player") returns only accepted, non-rejected connections.
    const existing = this.ctx.getWebSockets("player");
    const [client, server] = Object.values(new WebSocketPair()) as [WebSocket, WebSocket];

    if (existing.length >= 2) {
      // Accept briefly so we can send the error, then close.
      this.ctx.acceptWebSocket(server, ["rejected"]);
      server.send(JSON.stringify({ type: "error", message: "Room is full" } as ServerMessage));
      server.close(1008, "Room is full");
      return new Response(null, { status: 101, webSocket: client });
    }

    const player: Player = existing.length === 0 ? PLAYER_ONE : PLAYER_TWO;
    // Tags: "player" (used to filter connections) + the player color (used as ID).
    this.ctx.acceptWebSocket(server, ["player", player]);

    let state = await this.getState();

    // First player into any non-waiting room: reset so they get a clean room.
    // Covers both a completed game ("ended") and an abandoned mid-game room ("playing").
    if (existing.length === 0 && state.phase !== "waiting") {
      state = initialState();
      await this.saveState(state);
    }

    server.send(JSON.stringify({ type: "welcome", player, roomState: state } as ServerMessage));

    if (existing.length === 1) {
      const newState: RoomState = { ...state, phase: "playing" };
      await this.saveState(newState);
      this.broadcast({ type: "state_update", roomState: newState });
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string): Promise<void> {
    const player = this.getPlayer(ws);
    if (!player) return;

    const msg = JSON.parse(message) as ClientMessage;
    let state = await this.getState();

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
        checkCell(cell, { columns: state.columns, rows: state.rows, values: newValues }),
      )
        .filter((dir) => dir.length > 3)
        .flat();

      winningCells.forEach((i) => { newValues[i] = `${player}-win`; });

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
        const idx = allPlayers.indexOf(player);
        nextPlayer = allPlayers[(idx + 1) % 2] ?? PLAYER_ONE;
      }

      state = { ...state, values: newValues, currentPlayer: nextPlayer, winner, phase };
      await this.saveState(state);
      this.broadcast({ type: "state_update", roomState: state });
    }

    if (msg.type === "reset") {
      if (state.phase !== "ended") return;
      state = { ...initialState(), phase: "playing" };
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
      .find((t): t is Player => t === PLAYER_ONE || t === PLAYER_TWO);
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
