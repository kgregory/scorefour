import type { allPlayers } from "./constants";

type Indices<T extends readonly unknown[]> = Exclude<Partial<T>["length"], 0>;

export interface Board<TValue = number> {
  values: Array<TValue>;
  columns: number;
  rows: number;
}
export type Players = Indices<typeof allPlayers>;
export type Player = (typeof allPlayers)[number];
export type PlayerWin = `${Player}-win`;
export type BoardValue = Player | PlayerWin | undefined;
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
