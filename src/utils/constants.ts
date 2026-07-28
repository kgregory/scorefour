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

export const DEFAULT_COLUMNS = 7;
export const DEFAULT_ROWS = 6;
export const DEFAULT_BOARD_CELLS = DEFAULT_COLUMNS * DEFAULT_ROWS;

export const MIN_BOARD_DIM = 4;
export const MAX_BOARD_DIM = 9;
