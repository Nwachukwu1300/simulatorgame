import type { SimulatorId } from "./simulatorStore";

/**
 * Achievements — the comedy layer's reward system (Stage 8).
 *
 * Pure data + one pure function so the rules are testable without React.
 * Copy is delivered with total sincerity: no exclamation marks.
 */

export interface ProgressStats {
  /** Real seconds spent existing as each object (HUD visible, not paused). */
  secondsBySim: Record<SimulatorId, number>;
  /** Total background events that started while the player was present. */
  eventsWitnessed: number;
  /** Unique event names ever witnessed, e.g. "ufo-crosses-sky". */
  seenEvents: string[];
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  /** Unlocks on witnessing this event (must match a name in a scene's events file). */
  event?: string;
  /** Unlocks when this returns true. Ignored when `event` is set. */
  earned?: (s: ProgressStats) => boolean;
}

const MIN = 60;
const total = (s: ProgressStats) =>
  s.secondsBySim.coconut + s.secondsBySim.bench + s.secondsBySim.idol;

export const ACHIEVEMENTS: Achievement[] = [
  { id: "still-here", title: "Still Here", desc: "One minute of existence. A promising start.", earned: (s) => total(s) >= MIN },
  { id: "professional-coconut", title: "Professional Coconut", desc: "Ten minutes as a coconut.", earned: (s) => s.secondsBySim.coconut >= 10 * MIN },
  { id: "civic-furniture", title: "Civic Furniture", desc: "Ten minutes as a bench.", earned: (s) => s.secondsBySim.bench >= 10 * MIN },
  { id: "object-of-worship", title: "Object of Worship", desc: "Ten minutes as an idol.", earned: (s) => s.secondsBySim.idol >= 10 * MIN },
  {
    id: "the-collection",
    title: "The Collection",
    desc: "One minute as each object. Range demonstrated.",
    earned: (s) => Object.values(s.secondsBySim).every((v) => v >= MIN),
  },
  { id: "hour-of-stillness", title: "An Hour of Stillness", desc: "One hour of total existence.", earned: (s) => total(s) >= 60 * MIN },
  { id: "witness", title: "Witness", desc: "Twenty-five events occurred nearby. You were present for all of them.", earned: (s) => s.eventsWitnessed >= 25 },
  { id: "unbothered", title: "Unbothered", desc: "One hundred events. You reacted to none.", earned: (s) => s.eventsWitnessed >= 100 },
  { id: "first-contact", title: "First Contact", desc: "An unidentified craft crossed the sky. You did not report it.", event: "ufo-crosses-sky" },
  { id: "maritime-indifference", title: "Maritime Indifference", desc: "A pirate ship passed offshore. You remained a coconut.", event: "pirate-ship-offshore" },
  { id: "audience-of-one", title: "Audience of One", desc: "A flash mob performed. You did not applaud.", event: "flash-mob" },
  { id: "you-saw-nothing", title: "You Saw Nothing", desc: "A banana ran past. This will not be discussed.", event: "banana-runs-past" },
  { id: "probably-nothing", title: "It Was Probably Nothing", desc: "Something stood behind the ruins.", event: "figure-behind-the-ruins" },
];

/** Achievements whose condition now holds but are not yet in `unlocked`. */
export function newlyEarned(stats: ProgressStats, unlocked: string[]): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) =>
      !unlocked.includes(a.id) &&
      (a.event ? stats.seenEvents.includes(a.event) : a.earned!(stats)),
  );
}
