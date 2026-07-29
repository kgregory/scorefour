import type { Player, BoardValue } from "./types";

export interface RoomState {
  values: BoardValue[];
  currentPlayer: Player;
  winner: Player | "draw" | null;
  phase: "waiting" | "playing" | "ended";
  rows: number;
  columns: number;
}

export type ClientMessage =
  | { type: "drop_piece"; column: number }
  | { type: "reset" }
  | { type: "quit" };

export type ServerMessage =
  | { type: "welcome"; player: Player; roomState: RoomState }
  | { type: "state_update"; roomState: RoomState }
  | { type: "opponent_left"; player: Player }
  | { type: "opponent_quit"; player: Player }
  | { type: "error"; message: string };
