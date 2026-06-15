export interface CircleProps {
  onClick?: () => void;
  color?: "empty" | "red" | "yellow" | "purple" | "green";
  isEmphasized?: boolean;
  isDense?: boolean;
  isWinner?: boolean;
}

const colorClasses: Record<NonNullable<CircleProps["color"]>, string> = {
  empty: "border-gray-200 bg-white",
  red: "border-red-500 bg-red-700 text-red-500",
  yellow: "border-amber-200 bg-amber-400 text-amber-200",
  purple: "border-purple-500 bg-purple-700 text-purple-500",
  green: "border-green-500 bg-green-600 text-green-500",
};

/** represents a space on the board - during game play, clicking a circle selects the lowest empty space in its column */
export const Circle = (props: CircleProps) => {
  const {
    onClick,
    color = "empty",
    isEmphasized = true,
    isDense = false,
    isWinner = false,
  } = props;

  const isDisabled = color !== "empty";

  return (
    <div
      className={`aspect-square min-w-8 rounded-full ${isEmphasized ? "border-4 border-solid border-blue-500" : ""} shadow-lg ${isDense ? "" : "sm:min-w-16"}`}
      onClick={onClick}
      role={onClick != null ? "button" : undefined}
      tabIndex={onClick != null ? (isDisabled ? -1 : 0) : undefined}
      aria-disabled={onClick != null ? isDisabled : undefined}
      onKeyDown={
        onClick != null
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      aria-label={color !== "empty" ? color : "empty slot"}
    >
      <div
        className={`flex aspect-square w-full select-none items-center justify-center rounded-full border-4 text-lg ${isWinner ? "animate-pulse" : ""} ${colorClasses[color]}`}
      >
        {!isDense && color !== "empty" && "4"}
      </div>
    </div>
  );
};
