import { useState } from "react";
import type { Players } from "~/utils/types";
import {
  usePlayers,
  useColumns,
  useRows,
  useSetPlayers,
  useSetColumns,
  useSetRows,
  useResetGame,
} from "~/context/GameState";

/** configuration for the game */
export const GameSettings = () => {
  const players = usePlayers();
  const columns = useColumns();
  const rows = useRows();

  const setPlayers = useSetPlayers();
  const setColumns = useSetColumns();
  const setRows = useSetRows();
  const resetGame = useResetGame();

  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <button onClick={resetGame} className="btn">
          Reset
        </button>
        <span className="text-gray-300">|</span>
        <button onClick={() => setSettingsVisible((v) => !v)}>
          Settings {settingsVisible ? " -" : " +"}
        </button>
      </div>
      {settingsVisible && (
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <label htmlFor="players">Players:</label>
            <select
              id="players"
              value={players}
              onChange={(e) => {
                setPlayers(parseInt(e.target.value, 10) as Players);
              }}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex gap-2">
            <label htmlFor="columns">Columns:</label>
            <select
              id="columns"
              value={columns}
              onChange={(e) => {
                setColumns(parseInt(e.target.value, 10));
              }}
            >
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
              <option value={9}>9</option>
            </select>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex gap-2">
            <label htmlFor="rows">Rows:</label>
            <select
              id="rows"
              value={rows}
              onChange={(e) => {
                setRows(parseInt(e.target.value, 10));
              }}
            >
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
              <option value={9}>9</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
};
