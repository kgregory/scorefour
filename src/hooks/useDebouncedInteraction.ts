import { useCallback, useRef } from "react";

/** simplified debounce for interactions (e.g. prevent spamming click) */
export const useDebouncedInteraction = (delay = 500) => {
  const lastClickTime = useRef(0);

  // ignore clicks that are too close together
  return useCallback(() => {
    const now = Date.now();
    if (now - lastClickTime.current < delay) {
      return false;
    }
    lastClickTime.current = now;
    return true;
  }, [delay]);
};
