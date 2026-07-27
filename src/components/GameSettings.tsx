import { useState } from "react";
import type { Players, Difficulty } from "~/utils/types";
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
    <>
      <button onClick={() => setSettingsVisible((v) => !v)}>
        Settings {settingsVisible ? " -" : " +"}
      </button>
      {settingsVisible && (
        <div className="grid grid-cols-[auto_auto] items-center gap-x-4 gap-y-1 text-sm">
          <label htmlFor="players">Players</label>
          <select className="w-24"
            id="players"
            value={players}
            onChange={(e) => setPlayers(parseInt(e.target.value, 10) as Players)}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
          <label htmlFor="columns">Columns</label>
          <select className="w-24"
            id="columns"
            value={columns}
            onChange={(e) => setColumns(parseInt(e.target.value, 10))}
          >
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
            <option value={9}>9</option>
          </select>
          <label htmlFor="rows">Rows</label>
          <select className="w-24"
            id="rows"
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value, 10))}
          >
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
            <option value={9}>9</option>
          </select>
          {players === 1 && (
            <>
              <label htmlFor="difficulty">Difficulty</label>
              <select className="w-24"
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
      )}
    </>
  );
};
