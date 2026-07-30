import type { Player, BoardValue } from "./types";

export interface RoomState {
  values: BoardValue[];
  currentPlayer: Player;
  winner: Player | "draw" | null;
  phase: "lobby" | "playing" | "ended";
  rows: number;
  columns: number;
  /** players connected to the room in join order; first entry is the host */
  lobbyPlayers: Player[];
  /** players who were present when the host started; determines turn order */
  gamePlayers: Player[];
}

export type ClientMessage =
  | { type: "drop_piece"; column: number }
  | { type: "start_game" }
  | { type: "reset" }
  | { type: "quit" };

export type ServerMessage =
  | { type: "welcome"; player: Player; roomState: RoomState }
  | { type: "state_update"; roomState: RoomState }
  | { type: "opponent_left"; player: Player }
  | { type: "opponent_quit"; player: Player }
  | { type: "error"; message: string };
