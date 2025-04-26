import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Dispatch, SetStateAction } from "react";
import { PLAYER_ONE } from "~/utils/constants";
import type { Players } from "~/utils/types";
import type { BoardValue, Player } from "~/utils/types";

type Values = Array<BoardValue>;
type Winner = Player | "draw" | null;

const PlayersContext = createContext<Players | undefined>(undefined);
const ColumnsContext = createContext<number | undefined>(undefined);
const RowsContext = createContext<number | undefined>(undefined);
const CurrentPlayerContext = createContext<Player | undefined>(undefined);
const ValuesContext = createContext<Values | undefined>(undefined);
const WinnerContext = createContext<Winner | undefined>(undefined);

type ContextSetter<TValue> = Dispatch<SetStateAction<TValue>> | undefined;

const SetPlayersContext = createContext<ContextSetter<Players>>(undefined);
const SetColumnsContext = createContext<ContextSetter<number>>(undefined);
const SetRowsContext = createContext<ContextSetter<number>>(undefined);
const SetCurrentPlayerContext = createContext<ContextSetter<Player>>(undefined);
const SetValuesContext = createContext<ContextSetter<Values>>(undefined);
const SetWinnerContext = createContext<ContextSetter<Winner>>(undefined);

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

  // reset the board when the number of rows or columns changes
  useEffect(() => {
    setValues(Array<BoardValue>(rows * columns).fill(undefined));
  }, [columns, rows]);

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
                      <SetCurrentPlayerContext.Provider
                        value={setCurrentPlayer}
                      >
                        <WinnerContext.Provider value={winner}>
                          <SetWinnerContext.Provider value={setWinner}>
                            {props.children}
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

/** get a function to reset the game using the current settings */
export const useResetGame = () => {
  const rows = useRows();
  const columns = useColumns();
  const setValues = useSetValues();
  const setCurrentPlayer = useSetCurrentPlayer();
  const setWinner = useSetWinner();

  return useCallback(() => {
    setValues(Array<BoardValue>(rows * columns).fill(undefined));
    setCurrentPlayer(PLAYER_ONE);
    setWinner(null);
  }, [columns, rows, setCurrentPlayer, setValues, setWinner]);
};
