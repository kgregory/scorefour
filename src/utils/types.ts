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
export type Screen = "start" | "playing" | "ended";
export type PlayerColor = (typeof allPlayers)[number] | "empty";
export type Difficulty = "easy" | "medium" | "hard";

/** "reactive" = take immediate wins/blocks, otherwise random; "minimax" = full lookahead */
export type MoveStrategy =
  { type: "reactive" } | { type: "minimax"; depth: number };
