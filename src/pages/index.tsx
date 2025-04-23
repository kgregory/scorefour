import Head from "next/head";
import * as React from "react";

const rows = 6;
const columns = 7;

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

/** starting from the specified cell index, continuing in the specified direction, return an array of indexes for continuously matching cells */
const checkDirection = <TValue,>({
  cell,
  value,
  direction,
  board,
}: {
  cell: number | undefined;
  value: TValue;
  direction: Direction;
  board: Board<TValue>;
}): number[] => {
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

const useGameState = () => {
  const [board, setBoard] = React.useState<
    Array<"red" | "yellow" | "win" | undefined>
  >(Array(rows * columns).fill(undefined));
  const [player, setPlayer] = React.useState<"red" | "yellow">("red");
  const [winner, setWinner] = React.useState<"red" | "yellow" | "draw">();

  return React.useMemo(
    () => ({
      board,
      player,
      winner,
      reset: () => {
        setBoard(Array(rows * columns).fill(undefined));
        setPlayer("red");
        setWinner(undefined);
      },
      update: (column: number) => {
        if (winner != null) {
          // nothing to do when the game's over (someone won or the players tied)
          return;
        }

        const newBoard = [...board];

        // check the column from the bottom up
        let cell = undefined;
        for (let i = rows - 1; i >= 0; i -= 1) {
          if (newBoard[i * columns + column] == null) {
            newBoard[i * columns + column] = player;
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
          checkCell(cell, { columns, rows, values: newBoard }),
        )
          .filter((direction) => direction.length > 3)
          .flat();

        // mark winning cells, if any
        winningCells.forEach((i) => {
          newBoard[i] = "win";
        });

        setWinner((winner) => {
          if (winningCells.length > 0) {
            return player;
          }
          if (newBoard.every((item) => item != null)) {
            // no winner and we're out of moves
            return "draw";
          }
          return winner;
        });

        setBoard(newBoard);
        setPlayer(player === "red" ? "yellow" : "red");
      },
    }),
    [board, player, winner],
  );
};

interface CircleProps {
  onClick: () => void;
  variant?: "empty" | "red" | "yellow" | "win";
}

const Circle = (props: CircleProps) => {
  const { onClick, variant = "empty" } = props;

  const colorClasses = React.useMemo(() => {
    if (variant === "red") {
      return "border-red-500 bg-red-700 text-red-500";
    }
    if (variant === "yellow") {
      return "border-amber-200 bg-amber-400 text-amber-200";
    }
    if (variant === "win") {
      return "border-green-500 bg-green-600 text-green-500";
    }
    return "border-gray-200 bg-white";
  }, [variant]);

  return (
    <div
      className="min-h-8 min-w-8 origin-center rounded-full border-4 border-solid border-blue-500 bg-white text-center text-lg shadow-lg sm:min-h-16 sm:min-w-16"
      onClick={onClick}
      role="button"
      aria-label={variant !== "empty" ? variant : "empty slot"}
    >
      <div
        className={`flex size-full items-center justify-center rounded-full border-4 ${colorClasses}`}
      >
        {variant !== "empty" ? "4" : <>&nbsp;</>}
      </div>
    </div>
  );
};

interface BoardProps {
  data: Array<"red" | "yellow" | "win" | undefined>;
  handleTurn: (column: number) => void;
}

const Board = (props: BoardProps) => {
  const { data, handleTurn } = props;
  return (
    <div className="min-w-96 border-8 border-solid border-blue-600 bg-gradient-to-b from-blue-700 to-blue-800 p-2 shadow-inner drop-shadow-md">
      <div className="grid grid-cols-7 gap-2">
        {Array(columns * rows)
          .fill(null)
          .map((item, i) => (
            <Circle
              key={i}
              variant={data[i]}
              onClick={() => handleTurn(i % columns)}
            ></Circle>
          ))}
      </div>
    </div>
  );
};

const Game = () => {
  const { board, player, winner, update, reset } = useGameState();

  return (
    <div className="flex flex-col items-center gap-8">
      {winner != null ? (
        winner === "draw" ? (
          <div>It&apos;s a draw!</div>
        ) : (
          <div className="capitalize">{winner} wins!</div>
        )
      ) : (
        <div>It&apos;s {player}&apos;s turn</div>
      )}
      <button onClick={reset} className="btn">
        Reset
      </button>
      <Board data={board} handleTurn={update} />
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
        <div className="container flex flex-col items-center justify-center px-4 py-12">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-700 sm:text-[5rem]">
            Score Four
          </h1>
        </div>
        <Game />
      </main>
    </>
  );
}
