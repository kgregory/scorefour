import { useState } from "react";
import type { Players, Difficulty } from "~/utils/types";
import {
  MIN_BOARD_DIM,
  MAX_BOARD_DIM,
  allPlayers,
  DEFAULT_PLAYERS,
  DEFAULT_COLUMNS,
  DEFAULT_ROWS,
  DEFAULT_DIFFICULTY,
} from "~/utils/constants";
import {
  usePlayers,
  useColumns,
  useRows,
  useSetPlayers,
  useSetColumns,
  useSetRows,
  useDifficulty,
  useSetDifficulty,
} from "~/context/GameState";

const BOARD_DIM_OPTIONS = Array.from(
  { length: MAX_BOARD_DIM - MIN_BOARD_DIM + 1 },
  (_, i) => MIN_BOARD_DIM + i,
);

/** configuration for the game */
export const GameSettings = () => {
  const players = usePlayers();
  const columns = useColumns();
  const rows = useRows();
  const difficulty = useDifficulty();

  const setPlayers = useSetPlayers();
  const setColumns = useSetColumns();
  const setRows = useSetRows();
  const setDifficulty = useSetDifficulty();

  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <button onClick={() => setSettingsVisible((v) => !v)}>
        Settings {settingsVisible ? " -" : " +"}
      </button>
      {settingsVisible && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[auto_auto] items-center gap-x-4 gap-y-1 text-sm">
            <label htmlFor="players">Players</label>
            <select
              className="w-24"
              id="players"
              value={players}
              onChange={(e) =>
                setPlayers(parseInt(e.target.value, 10) as Players)
              }
            >
              {Array.from({ length: allPlayers.length }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <label htmlFor="columns">Columns</label>
            <select
              className="w-24"
              id="columns"
              value={columns}
              onChange={(e) => setColumns(parseInt(e.target.value, 10))}
            >
              {BOARD_DIM_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <label htmlFor="rows">Rows</label>
            <select
              className="w-24"
              id="rows"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value, 10))}
            >
              {BOARD_DIM_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            {players === 1 && (
              <>
                <label htmlFor="difficulty">Difficulty</label>
                <select
                  className="w-24"
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </>
            )}
          </div>
          <button
            className="text-xs text-slate-400 hover:text-slate-600"
            onClick={() => {
              setPlayers(DEFAULT_PLAYERS);
              setColumns(DEFAULT_COLUMNS);
              setRows(DEFAULT_ROWS);
              setDifficulty(DEFAULT_DIFFICULTY);
            }}
          >
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  );
};
