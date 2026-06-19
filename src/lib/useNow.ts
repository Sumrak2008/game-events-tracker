"use client";

import { useEffect, useState } from "react";

/**
 * Returns a "current time" value that is stable during SSR/hydration (it starts
 * from the server-provided timestamp, so the first client render matches the
 * server HTML) and then ticks forward on the client. This keeps derived
 * statuses live without causing hydration mismatches.
 */
export function useNow(serverNow: number, intervalMs = 60_000): number {
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    const update = () => setNow(Date.now());
    // Defer the first correction so we don't call setState synchronously in the
    // effect body (which would trigger a cascading render).
    const first = setTimeout(update, 0);
    const id = setInterval(update, intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [intervalMs]);

  return now;
}
