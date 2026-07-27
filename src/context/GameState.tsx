import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Dispatch, SetStateAction } from "react";
import { PLAYER_ONE } from "~/utils/constants";
import type { Players, Screen, Difficulty } from "~/utils/types";
import type { BoardValue, Player } from "~/utils/types";

type Values = Array<BoardValue>;
type Winner = Player | "draw" | null;

const PlayersContext = createContext<Players | undefined>(undefined);
const ColumnsContext = createContext<number | undefined>(undefined);
const RowsContext = createContext<number | undefined>(undefined);
const CurrentPlayerContext = createContext<Player | undefined>(undefined);
const ValuesContext = createContext<Values | undefined>(undefined);
const WinnerContext = createContext<Winner | undefined>(undefined);
const DifficultyContext = createContext<Difficulty | undefined>(undefined);
const ScreenContext = createContext<Screen | undefined>(undefined);
const WasQuitContext = createContext<Player | null | undefined>(undefined);

type ContextSetter<TValue> = Dispatch<SetStateAction<TValue>> | undefined;

const SetPlayersContext = createContext<ContextSetter<Players>>(undefined);
const SetColumnsContext = createContext<ContextSetter<number>>(undefined);
const SetRowsContext = createContext<ContextSetter<number>>(undefined);
const SetCurrentPlayerContext = createContext<ContextSetter<Player>>(undefined);
const SetValuesContext = createContext<ContextSetter<Values>>(undefined);
const SetWinnerContext = createContext<ContextSetter<Winner>>(undefined);
const SetDifficultyContext = createContext<ContextSetter<Difficulty>>(undefined);
const SetScreenContext = createContext<ContextSetter<Screen>>(undefined);
const SetWasQuitContext = createContext<ContextSetter<Player | null>>(undefined);

interface GameStateProviderProps {
  children: React.ReactNode;
}

export const GameStateProvider = (props: GameStateProviderProps) => {
  const [players, setPlayers] = useState<Players>(2);
  const [columns, setColumns] = useState(7);
  const [rows, setRows] = useState(6);
  const [values, setValues] = useState(
    Array<BoardValue>(rows * columns).fill(undefined),
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>(PLAYER_ONE);
  const [winner, setWinner] = useState<Player | "draw" | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [screen, setScreen] = useState<Screen>("start");
  const [wasQuit, setWasQuit] = useState<Player | null>(null);

  const screenRef = useRef(screen);
  screenRef.current = screen;

  // Dimension changes: resize the board and reset turn order.
  useEffect(() => {
    if (screenRef.current === "ended") return;
    setValues(Array<BoardValue>(rows * columns).fill(undefined));
    setCurrentPlayer(PLAYER_ONE);
  }, [columns, rows]);

  // Player count change: reset the board but keep the current turn.
  useEffect(() => {
    if (screenRef.current === "ended") return;
    setValues((prev) => Array<BoardValue>(prev.length).fill(undefined));
  }, [players]);

  return (
    <PlayersContext.Provider value={players}>
      <SetPlayersContext.Provider value={setPlayers}>
        <ColumnsContext.Provider value={columns}>
          <SetColumnsContext.Provider value={setColumns}>
            <RowsContext.Provider value={rows}>
              <SetRowsContext.Provider value={setRows}>
                <ValuesContext.Provider value={values}>
                  <SetValuesContext.Provider value={setValues}>
                    <CurrentPlayerContext.Provider value={currentPlayer}>
                      <SetCurrentPlayerContext.Provider value={setCurrentPlayer}>
                        <WinnerContext.Provider value={winner}>
                          <SetWinnerContext.Provider value={setWinner}>
                            <DifficultyContext.Provider value={difficulty}>
                              <SetDifficultyContext.Provider value={setDifficulty}>
                                <ScreenContext.Provider value={screen}>
                                  <SetScreenContext.Provider value={setScreen}>
                                    <WasQuitContext.Provider value={wasQuit}>
                                      <SetWasQuitContext.Provider value={setWasQuit}>
                                        {props.children}
                                      </SetWasQuitContext.Provider>
                                    </WasQuitContext.Provider>
                                  </SetScreenContext.Provider>
                                </ScreenContext.Provider>
                              </SetDifficultyContext.Provider>
                            </DifficultyContext.Provider>
                          </SetWinnerContext.Provider>
                        </WinnerContext.Provider>
                      </SetCurrentPlayerContext.Provider>
                    </CurrentPlayerContext.Provider>
                  </SetValuesContext.Provider>
                </ValuesContext.Provider>
              </SetRowsContext.Provider>
            </RowsContext.Provider>
          </SetColumnsContext.Provider>
        </ColumnsContext.Provider>
      </SetPlayersContext.Provider>
    </PlayersContext.Provider>
  );
};

/** get number of players from context */
export const usePlayers = () => {
  const context = useContext(PlayersContext);
  if (context === undefined) {
    throw new Error("usePlayers must be used within a GameStateProvider");
  }
  return context;
};

/** get the number of columns on the board from context */
export const useColumns = () => {
  const context = useContext(ColumnsContext);
  if (context === undefined) {
    throw new Error("useColumns must be used within a GameStateProvider");
  }
  return context;
};

/** get the number of rows on the board from context */
export const useRows = () => {
  const context = useContext(RowsContext);
  if (context === undefined) {
    throw new Error("useRows must be used within a GameStateProvider");
  }
  return context;
};

/** get the current player from context */
export const useCurrentPlayer = () => {
  const context = useContext(CurrentPlayerContext);
  if (context === undefined) {
    throw new Error("useCurrentPlayer must be used within a GameStateProvider");
  }
  return context;
};

/** get the board's values from context */
export const useValues = () => {
  const context = useContext(ValuesContext);
  if (context === undefined) {
    throw new Error("useValues must be used within a GameStateProvider");
  }
  return context;
};

/** get the winner state from context */
export const useWinner = () => {
  const context = useContext(WinnerContext);
  if (context === undefined) {
    throw new Error("useWinner must be used within a GameStateProvider");
  }
  return context;
};

/** get the current AI difficulty from context */
export const useDifficulty = () => {
  const context = useContext(DifficultyContext);
  if (context === undefined) {
    throw new Error("useDifficulty must be used within a GameStateProvider");
  }
  return context;
};

/** get the current screen from context */
export const useScreen = () => {
  const context = useContext(ScreenContext);
  if (context === undefined) {
    throw new Error("useScreen must be used within a GameStateProvider");
  }
  return context;
};

/** get whether the last game was quit (vs won/drawn) */
export const useWasQuit = () => {
  const context = useContext(WasQuitContext);
  if (context === undefined) {
    throw new Error("useWasQuit must be used within a GameStateProvider");
  }
  return context;
};

/** get the setter for the number of players from context */
export const useSetPlayers = () => {
  const context = useContext(SetPlayersContext);
  if (context === undefined) {
    throw new Error("useSetPlayers must be used within a GameStateProvider");
  }
  return context;
};

/** get the setter for the board's number of columns from context */
export const useSetColumns = () => {
  const context = useContext(SetColumnsContext);
  if (context === undefined) {
    throw new Error("useSetColumns must be used within a GameStateProvider");
  }
  return context;
};

/** get the setter for the board's number of rows from context */
export const useSetRows = () => {
  const context = useContext(SetRowsContext);
  if (context === undefined) {
    throw new Error("useSetRows must be used within a GameStateProvider");
  }
  return context;
};

/** get the setter for the current player from context */
export const useSetCurrentPlayer = () => {
  const context = useContext(SetCurrentPlayerContext);
  if (context === undefined) {
    throw new Error(
      "useSetCurrentPlayer must be used within a GameStateProvider",
    );
  }
  return context;
};

/** get the setter for the board's values from context */
export const useSetValues = () => {
  const context = useContext(SetValuesContext);
  if (context === undefined) {
    throw new Error("useSetValues must be used within a GameStateProvider");
  }
  return context;
};

/** get the setter for the winner state from context */
export const useSetWinner = () => {
  const context = useContext(SetWinnerContext);
  if (context === undefined) {
    throw new Error("useSetWinner must be used within a GameStateProvider");
  }
  return context;
};

/** get the setter for the AI difficulty from context */
export const useSetDifficulty = () => {
  const context = useContext(SetDifficultyContext);
  if (context === undefined) {
    throw new Error("useSetDifficulty must be used within a GameStateProvider");
  }
  return context;
};

/** get the setter for the current screen from context */
export const useSetScreen = () => {
  const context = useContext(SetScreenContext);
  if (context === undefined) {
    throw new Error("useSetScreen must be used within a GameStateProvider");
  }
  return context;
};

/** get the setter for the wasQuit flag from context */
export const useSetWasQuit = () => {
  const context = useContext(SetWasQuitContext);
  if (context === undefined) {
    throw new Error("useSetWasQuit must be used within a GameStateProvider");
  }
  return context;
};

/** get a function to reset game state and begin a new game */
export const useStartGame = () => {
  const rows = useRows();
  const columns = useColumns();
  const setValues = useSetValues();
  const setCurrentPlayer = useSetCurrentPlayer();
  const setWinner = useSetWinner();
  const setScreen = useSetScreen();
  const setWasQuit = useSetWasQuit();

  return useCallback(() => {
    setValues(Array<BoardValue>(rows * columns).fill(undefined));
    setCurrentPlayer(PLAYER_ONE);
    setWinner(null);
    setWasQuit(null);
    setScreen("playing");
  }, [columns, rows, setCurrentPlayer, setScreen, setValues, setWasQuit, setWinner]);
};
