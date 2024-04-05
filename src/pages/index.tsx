import Head from "next/head";
import * as React from "react";

const rows = 6;
const columns = 7;

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
      className="min-h-16 min-w-16 origin-center rounded-full border-4 border-solid border-blue-500 bg-white text-center text-lg  shadow-lg"
      onClick={onClick}
      role="button"
    >
      <div
        className={`flex min-h-16 min-w-16 items-center justify-center rounded-full border-4 ${colorClasses}`}
      >
        {variant !== "empty" ? "4" : null}
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
            <>
              <Circle
                key={i}
                variant={data[i]}
                onClick={() => handleTurn(i % columns)}
              ></Circle>
            </>
          ))}
      </div>
    </div>
  );
};

const Game = () => {
  const [board, setBoard] = React.useState<
    Array<"red" | "yellow" | "win" | undefined>
  >(Array(rows * columns).fill(undefined));
  const [player, setPlayer] = React.useState<"red" | "yellow">("red");
  const [winner, setWinner] = React.useState<"red" | "yellow" | "draw">();

  const handleTurn = (column: number) => {
    if (winner != null) {
      return;
    }

    const newBoard = [...board];
    // check the column from the bottom up
    for (let i = rows - 1; i >= 0; i -= 1) {
      if (newBoard[i * columns + column] == null) {
        newBoard[i * columns + column] = player;
        break;
      }
    }

    // row check
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns - 3; j++) {
        if (
          newBoard[i * columns + j] === player &&
          newBoard[i * columns + j + 1] === player &&
          newBoard[i * columns + j + 2] === player &&
          newBoard[i * columns + j + 3] === player
        ) {
          newBoard[i * columns + j] = "win";
          newBoard[i * columns + j + 1] = "win";
          newBoard[i * columns + j + 2] = "win";
          newBoard[i * columns + j + 3] = "win";
        }
      }
    }

    // column check
    for (let i = 0; i < rows - 3; i++) {
      for (let j = 0; j < columns; j++) {
        if (
          newBoard[i * columns + j] === player &&
          newBoard[(i + 1) * columns + j] === player &&
          newBoard[(i + 2) * columns + j] === player &&
          newBoard[(i + 3) * columns + j] === player
        ) {
          newBoard[i * columns + j] = "win";
          newBoard[(i + 1) * columns + j] = "win";
          newBoard[(i + 2) * columns + j] = "win";
          newBoard[(i + 3) * columns + j] = "win";
          setWinner(player);
        }
      }

      // diagonal check
      for (let j = 0; j < columns - 3; j++) {
        if (
          newBoard[i * columns + j] === player &&
          newBoard[(i + 1) * columns + j + 1] === player &&
          newBoard[(i + 2) * columns + j + 2] === player &&
          newBoard[(i + 3) * columns + j + 3] === player
        ) {
          newBoard[i * columns + j] = "win";
          newBoard[(i + 1) * columns + j + 1] = "win";
          newBoard[(i + 2) * columns + j + 2] = "win";
          newBoard[(i + 3) * columns + j + 3] = "win";
          setWinner(player);
        }
        if (
          newBoard[i * columns + j + 3] === player &&
          newBoard[(i + 1) * columns + j + 2] === player &&
          newBoard[(i + 2) * columns + j + 1] === player &&
          newBoard[(i + 3) * columns + j] === player
        ) {
          newBoard[i * columns + j + 3] = "win";
          newBoard[(i + 1) * columns + j + 2] = "win";
          newBoard[(i + 2) * columns + j + 1] = "win";
          newBoard[(i + 3) * columns + j] = "win";
          setWinner(player);
        }
      }
    }

    setBoard(newBoard);
    setPlayer(player === "red" ? "yellow" : "red");
  };

  const handleReset = () => {
    setBoard(Array(rows * columns).fill(undefined));
    setPlayer("red");
    setWinner(undefined);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {winner != null ? (
        winner === "draw" ? (
          <div>It&apos;s a draw!</div>
        ) : (
          <div className="capitalize">{winner} wins!</div>
        )
      ) : (
        <div>It&apos;s {player}&apos;s turn</div>
      )}
      <button onClick={handleReset} className="btn">
        Reset
      </button>
      <Board data={board} handleTurn={handleTurn} />
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100">
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
