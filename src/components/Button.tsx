import type { ReactNode } from "react";

interface ButtonProps {
  onClick?: () => void;
  variant?: "primary" | "secondary";
  children: ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "rounded-sm bg-blue-600 px-6 py-2 font-semibold text-white shadow-sm hover:bg-blue-700",
  secondary:
    "rounded-sm border-2 border-blue-600 px-6 py-2 font-semibold text-blue-600 hover:bg-blue-50",
};

export const Button = ({
  onClick,
  variant = "primary",
  children,
}: ButtonProps) => (
  <button onClick={onClick} className={variantClasses[variant]}>
    {children}
  </button>
);
