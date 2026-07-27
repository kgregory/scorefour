export const PLAYER_ONE = "red";
export const PLAYER_TWO = "yellow";
export const PLAYER_THREE = "purple";
export const PLAYER_FOUR = "green";
export const allPlayers = [
  PLAYER_ONE,
  PLAYER_TWO,
  PLAYER_THREE,
  PLAYER_FOUR,
] as const;

export type Difficulty = "easy" | "medium" | "hard";

/** "reactive" = take immediate wins/blocks, otherwise random; "minimax" = full lookahead */
export type MoveStrategy =
  | { type: "reactive" }
  | { type: "minimax"; depth: number };

export const DIFFICULTY_STRATEGY: Record<Difficulty, MoveStrategy> = {
  easy: { type: "reactive" },
  medium: { type: "minimax", depth: 4 },
  hard: { type: "minimax", depth: 7 },
};
