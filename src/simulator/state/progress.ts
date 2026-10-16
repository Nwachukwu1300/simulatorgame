import { create } from "zustand";
import { persist } from "zustand/middleware";
import { newlyEarned, type Achievement, type ProgressStats } from "./achievements";
import type { SimulatorId } from "./simulatorStore";

/**
 * Lifetime progress: time existed, events witnessed, achievements.
 * Saved to localStorage so the player's record survives reloads.
 */

interface ProgressState extends ProgressStats {
  unlocked: string[];
  /** Newly unlocked achievements waiting to be shown. Not persisted. */
  toasts: Achievement[];
  addTime: (sim: SimulatorId, seconds: number) => void;
  recordEvent: (name: string) => void;
  dismissToast: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => {
      // Applies new stats and queues any achievements they unlock.
      const commit = (stats: ProgressStats) => {
        const { unlocked, toasts } = get();
        const fresh = newlyEarned(stats, unlocked);
        set({
          ...stats,
          unlocked: [...unlocked, ...fresh.map((a) => a.id)],
          toasts: [...toasts, ...fresh],
        });
      };

      return {
        secondsBySim: { coconut: 0, bench: 0, idol: 0 },
        eventsWitnessed: 0,
        seenEvents: [],
        unlocked: [],
        toasts: [],

        addTime: (sim, seconds) => {
          const s = get();
          commit({
            secondsBySim: { ...s.secondsBySim, [sim]: s.secondsBySim[sim] + seconds },
            eventsWitnessed: s.eventsWitnessed,
            seenEvents: s.seenEvents,
          });
        },
        recordEvent: (name) => {
          const s = get();
          commit({
            secondsBySim: s.secondsBySim,
            eventsWitnessed: s.eventsWitnessed + 1,
            seenEvents: s.seenEvents.includes(name) ? s.seenEvents : [...s.seenEvents, name],
          });
        },
        dismissToast: () => set((s) => ({ toasts: s.toasts.slice(1) })),
      };
    },
    {
      name: "simulator-collection-progress",
      partialize: (s) => ({
        secondsBySim: s.secondsBySim,
        eventsWitnessed: s.eventsWitnessed,
        seenEvents: s.seenEvents,
        unlocked: s.unlocked,
      }),
    },
  ),
);

/** Formats seconds as "hh:mm:ss". */
export function formatDuration(seconds: number): string {
  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(Math.floor(seconds % 60)).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
