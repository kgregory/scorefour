import { useState } from "react";
import type { ReactNode } from "react";

interface ExpanderProps {
  label: string;
  children: (close: () => void) => ReactNode;
}

export const Expander = ({ label, children }: ExpanderProps) => {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded((v) => !v);
  const close = () => setExpanded(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <button onClick={toggle}>
        {label} {expanded ? " -" : " +"}
      </button>
      {expanded && children(close)}
    </div>
  );
};
