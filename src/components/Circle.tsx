import { useMemo } from "react";

export interface CircleProps {
  onClick?: () => void;
  color?: "empty" | "red" | "yellow" | "purple" | "green";
  isEmphasized?: boolean;
  isDense?: boolean;
  isWinner?: boolean;
}

/** represents a space on the board - during game play, clicking a circle selects the lowest empty space in its column */
export const Circle = (props: CircleProps) => {
  const {
    onClick,
    color = "empty",
    isEmphasized = true,
    isDense = false,
    isWinner = false,
  } = props;

  const colorClasses = useMemo(() => {
    if (color === "red") {
      return "border-red-500 bg-red-700 text-red-500";
    }
    if (color === "yellow") {
      return "border-amber-200 bg-amber-400 text-amber-200";
    }
    if (color === "purple") {
      return "border-purple-500 bg-purple-700 text-purple-500";
    }
    if (color === "green") {
      return "border-green-500 bg-green-600 text-green-500";
    }
    return "border-gray-200 bg-white";
  }, [color]);

  // non-empty circles are not clickable
  const isDisabled = color !== "empty";

  return (
    <div
      className={`min-h-8 min-w-8 rounded-full ${isEmphasized ? "border-4 border-solid border-blue-500" : ""} text-lg shadow-lg ${isDense ? "" : "sm:min-h-16 sm:min-w-16"}`}
      {...(onClick != null
        ? {
            onClick,
            role: "button",
            tabIndex: isDisabled ? -1 : 0,
            "aria-disabled": isDisabled,
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === " ") {
                onClick();
              }
            },
          }
        : {})}
      aria-label={color !== "empty" ? color : "empty slot"}
    >
      <div
        className={`flex size-full select-none items-center justify-center rounded-full border-4 ${isWinner ? "animate-pulse" : ""} ${colorClasses}`}
      >
        {isDense ? null : color !== "empty" ? "4" : <>&nbsp;</>}
      </div>
    </div>
  );
};
