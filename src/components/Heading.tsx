import type { ReactNode } from "react";

interface HeadingProps {
  children?: ReactNode;
}

export const Heading = ({ children }: HeadingProps) => (
  <div className="container flex items-center justify-between gap-2 px-4 pt-8 sm:gap-4">
    <h1 className="text-4xl font-extrabold tracking-[-2px] text-slate-700">
      Score Four
    </h1>
    {children}
  </div>
);
