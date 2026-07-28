import type { ReactNode } from "react";

interface BoardShellProps {
  columns: number;
  children: ReactNode;
}

/** shared board container — blue frame + center-justified cell grid */
export const BoardShell = ({ columns, children }: BoardShellProps) => (
  <div className="min-w-96 border-8 border-solid border-blue-600 bg-gradient-to-b from-blue-700 to-blue-800 p-2 shadow-inner drop-shadow-md">
    <div
      className="grid justify-items-center gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {children}
    </div>
  </div>
);
