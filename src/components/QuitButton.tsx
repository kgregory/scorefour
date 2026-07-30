import { Expander } from "./Expander";

interface QuitButtonProps {
  onQuit: () => void;
}

export const QuitButton = ({ onQuit }: QuitButtonProps) => (
  <Expander label="Quit">
    {(close) => (
      <div className="flex flex-col items-center gap-2 text-xs text-slate-400">
        <button className="hover:text-slate-600" onClick={onQuit}>
          Quit Game
        </button>
        <button className="hover:text-slate-600" onClick={close}>
          Keep Playing
        </button>
      </div>
    )}
  </Expander>
);
