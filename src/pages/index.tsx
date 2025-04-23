import Head from "next/head";
import { useMemo, useState } from "react";

interface Board<TValue = number> {
  values: Array<TValue>;
  columns: number;
  rows: number;
}

type Direction = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

const adjacentCellIndexes = new Map<
  string,
  Record<Direction, number | undefined>
>();

/** get the indexes of the adjacent cells in each direction, where applicable and memoize using a map keyed by the cell */
const getAdjacentCellIndexes = <TValue,>(
  cell: number,
  board: Board<TValue>,
) => {
  const { columns, rows } = board;

  // key considers board-size
  const cellKey = `${cell}_${rows}_${columns}`;

  const cached = adjacentCellIndexes.get(cellKey);
  if (cached != null) {
    return cached;
  }

  // there might not be an adjacent cell in all directions
  const row = Math.floor(cell / columns);
  const hasN = cell >= columns;
  const hasE = Math.floor((cell + 1) / columns) <= row;
  const hasS = cell <= (rows - 1) * columns - 1;
  const hasW = Math.floor((cell - 1) / columns) >= row;
  const hasNW = hasN && hasW;
  const hasNE = hasN && hasE;
  const hasSW = hasS && hasW;
  const hasSE = hasS && hasE;

  // relative indices for each direction
  const n = cell - columns;
  const w = cell - 1;
  const e = cell + 1;
  const s = cell + columns;
  const ne = n + 1;
  const nw = n - 1;
  const se = s + 1;
  const sw = s - 1;

  const result = {
    n: hasN ? n : undefined,
    w: hasW ? w : undefined,
    e: hasE ? e : undefined,
    s: hasS ? s : undefined,
    ne: hasNE ? ne : undefined,
    nw: hasNW ? nw : undefined,
    se: hasSE ? se : undefined,
    sw: hasSW ? sw : undefined,
  };

  adjacentCellIndexes.set(cellKey, result);

  return result;
};

/** get cell index for each adjacent position, by direction */
const getAdjacentCells = <TValue,>(cell: number, board: Board<TValue>) => {
  const { values } = board;

  const { n, w, e, s, ne, se, sw, nw } = getAdjacentCellIndexes(cell, board);

  // return adjacent cells with matching values
  const value = values[cell];
  return {
    n: n != null && values[n] === value ? n : undefined,
    ne: ne != null && values[ne] === value ? ne : undefined,
    e: e != null && values[e] === value ? e : undefined,
    se: se != null && values[se] === value ? se : undefined,
    s: s != null && values[s] === value ? s : undefined,
    sw: sw != null && values[sw] === value ? sw : undefined,
    w: w != null && values[w] === value ? w : undefined,
    nw: nw != null && values[nw] === value ? nw : undefined,
  };
};

interface CheckDirectionParams<TValue> {
  cell: number | undefined;
  value: TValue;
  direction: Direction;
  board: Board<TValue>;
}

/** starting from the specified cell index, continuing in the specified direction, return an array of indexes for continuously matching cells */
const checkDirection = <TValue,>({
  cell,
  value,
  direction,
  board,
}: CheckDirectionParams<TValue>): number[] => {
  const { values } = board;

  if (cell == null || values[cell] !== value) {
    return [];
  }

  const adjacentCell = getAdjacentCells(cell, board)[direction];

  return [
    cell,
    ...checkDirection({ cell: adjacentCell, value, direction, board }),
  ];
};

/** check horizontal, vertical, and diagonal from the specified cell index */
const checkCell = <TValue,>(cell: number, board: Board<TValue>) => {
  const { values } = board;

  const value = values[cell];

  if (value == null) {
    return {
      vertical: [],
      horizontal: [],
      diagonal: [],
      reverseDiagonal: [],
    };
  }

  const { n, ne, e, se, s, sw, w, nw } = getAdjacentCells(cell, board);

  const vertical = [
    cell,
    ...checkDirection({ cell: n, direction: "n", value, board }),
    ...checkDirection({ cell: s, direction: "s", value, board }),
  ];

  const horizontal = [
    cell,
    ...checkDirection({ cell: w, direction: "w", value, board }),
    ...checkDirection({ cell: e, direction: "e", value, board }),
  ];

  const diagonal = [
    cell,
    ...checkDirection({ cell: nw, direction: "nw", value, board }),
    ...checkDirection({ cell: se, direction: "se", value, board }),
  ];

  const reverseDiagonal = [
    cell,
    ...checkDirection({ cell: ne, direction: "ne", value, board }),
    ...checkDirection({ cell: sw, direction: "sw", value, board }),
  ];

  return {
    vertical,
    horizontal,
    diagonal,
    reverseDiagonal,
  };
};

type Player = "red" | "yellow" | "purple";
type BoardValue = Player | "win" | undefined;

const useGameState = () => {
  const [players, setPlayers] = useState<2 | 3>(2);
  const [columns, setColumns] = useState(7);
  const [rows, setRows] = useState(6);
  const [values, setValues] = useState<Array<BoardValue>>(
    Array<BoardValue>(rows * columns).fill(undefined),
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>("red");
  const [winner, setWinner] = useState<Player | "draw">();

  return useMemo(
    () => ({
      players,
      rows,
      columns,
      values,
      currentPlayer,
      winner,
      reconfigure: (options: {
        players?: 2 | 3;
        columns?: number;
        rows?: number;
      }) => {
        const newPlayers = options.players ?? players;
        const newColumns = options.columns ?? columns;
        const newRows = options.rows ?? rows;
        setColumns(newColumns);
        setRows(newRows);
        setPlayers(newPlayers);
        if (newPlayers != players || newColumns != columns || newRows != rows) {
          setValues(Array<BoardValue>(newRows * newColumns).fill(undefined));
          setCurrentPlayer("red");
          setWinner(undefined);
        }
      },
      reset: () => {
        setValues(Array<BoardValue>(rows * columns).fill(undefined));
        setCurrentPlayer("red");
        setWinner(undefined);
      },
      update: (column: number) => {
        if (winner != null) {
          // nothing to do when the game's over (someone won or the players tied)
          return;
        }

        const newValues = [...values];

        // check the column from the bottom up
        let cell = undefined;
        for (let i = rows - 1; i >= 0; i -= 1) {
          if (newValues[i * columns + column] == null) {
            newValues[i * columns + column] = currentPlayer;
            cell = i * columns + column;
            break;
          }
        }

        if (cell == null) {
          // no need to check the board for an invalid move
          return;
        }

        // filter the adjoining cells by the directions that have at least 4 in a row
        const winningCells = Object.values(
          checkCell(cell, { columns, rows, values: newValues }),
        )
          .filter((direction) => direction.length > 3)
          .flat();

        // mark winning cells, if any
        winningCells.forEach((i) => {
          newValues[i] = "win";
        });

        if (winningCells.length > 0) {
          setWinner(currentPlayer);
        } else if (newValues.every((value) => value != null)) {
          // no winner and we're out of moves
          setWinner("draw");
        } else {
          setCurrentPlayer((player) => {
            if (players === 2) {
              return player === "red" ? "yellow" : "red";
            }
            // three players
            if (player === "red") {
              return "yellow";
            }
            if (player === "yellow") {
              return "purple";
            }
            return "red";
          });
        }

        setValues(newValues);
      },
    }),
    [players, rows, columns, values, currentPlayer, winner],
  );
};

interface CircleProps {
  onClick?: () => void;
  variant?: "empty" | "red" | "yellow" | "purple" | "win";
  isEmphasized?: boolean;
  isDense?: boolean;
}

const Circle = (props: CircleProps) => {
  const {
    onClick,
    variant = "empty",
    isEmphasized = true,
    isDense = false,
  } = props;

  const colorClasses = useMemo(() => {
    if (variant === "red") {
      return "border-red-500 bg-red-700 text-red-500";
    }
    if (variant === "yellow") {
      return "border-amber-200 bg-amber-400 text-amber-200";
    }
    if (variant === "purple") {
      return "border-purple-500 bg-purple-700 text-purple-500";
    }
    if (variant === "win") {
      return "border-green-500 bg-green-600 text-green-500";
    }
    return "border-gray-200 bg-white";
  }, [variant]);

  return (
    <div
      className={`min-h-8 min-w-8 origin-center rounded-full ${isEmphasized ? "border-4 border-solid border-blue-500" : ""} bg-white text-center text-lg shadow-lg ${isDense ? "" : "sm:min-h-16 sm:min-w-16"}`}
      {...(onClick != null
        ? {
            onClick,
            role: "button",
            tabIndex: variant === "empty" ? 0 : -1,
            "aria-disabled": variant !== "empty",
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === " ") {
                onClick();
              }
            },
          }
        : {})}
      aria-label={variant !== "empty" ? variant : "empty slot"}
    >
      <div
        className={`flex size-full items-center justify-center rounded-full border-4 ${colorClasses}`}
      >
        {isDense ? null : variant !== "empty" ? "4" : <>&nbsp;</>}
      </div>
    </div>
  );
};

interface BoardProps {
  rows: number;
  columns: number;
  values: Array<BoardValue>;
  handleTurn: (column: number) => void;
}

const Board = (props: BoardProps) => {
  const { rows, columns, values, handleTurn } = props;
  return (
    <div className="min-w-96 border-8 border-solid border-blue-600 bg-gradient-to-b from-blue-700 to-blue-800 p-2 shadow-inner drop-shadow-md">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array(columns * rows)
          .fill(null)
          .map((item, i) => (
            <Circle
              key={i}
              variant={values[i]}
              onClick={() => handleTurn(i % columns)}
            ></Circle>
          ))}
      </div>
    </div>
  );
};

interface GameStatusProps {
  currentPlayer: ReturnType<typeof useGameState>["currentPlayer"];
  players: number;
  winner: ReturnType<typeof useGameState>["winner"];
}

const GameStatus = (props: GameStatusProps) => {
  const { currentPlayer, players, winner } = props;

  return (
    <div className="container flex flex-col gap-2 px-4 pt-8">
      <div className="container flex items-center justify-between">
        <h1 className="grow-1 flex text-4xl font-extrabold tracking-tight text-slate-700">
          Score Four
        </h1>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${players}, 1fr)` }}
        >
          <Circle
            variant="red"
            isEmphasized={currentPlayer === "red"}
            isDense
          />
          <Circle
            variant="yellow"
            isEmphasized={currentPlayer === "yellow"}
            isDense
          />
          {players === 3 && (
            <Circle
              variant="purple"
              isEmphasized={currentPlayer === "purple"}
              isDense
            />
          )}
        </div>
      </div>
      <div className="flex justify-end">
        {winner != null ? (
          winner === "draw" ? (
            <div>It&apos;s a draw!</div>
          ) : (
            <div className="capitalize">{winner} wins!</div>
          )
        ) : (
          <div>It&apos;s {currentPlayer}&apos;s turn</div>
        )}
      </div>
    </div>
  );
};

interface GameSettingsProps {
  players: number;
  columns: number;
  rows: number;
  reconfigure: ReturnType<typeof useGameState>["reconfigure"];
}

const GameSettings = (props: GameSettingsProps) => {
  const { players, columns, rows, reconfigure } = props;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-2">
        <label htmlFor="players">Players:</label>
        <select
          id="players"
          value={players}
          onChange={(e) => {
            const players = parseInt(e.target.value, 10) as 2 | 3;
            reconfigure({ players });
          }}
        >
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
      </div>
      <span className="text-gray-300">|</span>
      <div className="flex gap-2">
        <label htmlFor="columns">Columns:</label>
        <select
          id="columns"
          value={columns}
          onChange={(e) => {
            const columns = parseInt(e.target.value, 10) as 2 | 3;
            reconfigure({ columns });
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
            const rows = parseInt(e.target.value, 10) as 2 | 3;
            reconfigure({ rows });
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
  );
};

const Game = () => {
  const {
    players,
    rows,
    columns,
    values,
    currentPlayer,
    winner,
    update,
    reconfigure,
    reset,
  } = useGameState();

  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <div className="flex flex-col items-center gap-8">
      <GameStatus
        currentPlayer={currentPlayer}
        players={players}
        winner={winner}
      />
      <Board
        rows={rows}
        columns={columns}
        values={values}
        handleTurn={update}
      />
      <div className="flex items-center gap-2">
        <button onClick={reset} className="btn">
          Reset
        </button>
        <span className="text-gray-300">|</span>
        <button onClick={() => setSettingsVisible((v) => !v)}>
          Settings {settingsVisible ? " -" : " +"}
        </button>
      </div>
      {settingsVisible && (
        <GameSettings
          players={players}
          columns={columns}
          rows={rows}
          reconfigure={reconfigure}
        />
      )}
    </div>
  );
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Score Four</title>
        <meta
          name="description"
          content="A fake board game called Score Four."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-white to-gray-100">
        <Game />
      </main>
    </>
  );
}
