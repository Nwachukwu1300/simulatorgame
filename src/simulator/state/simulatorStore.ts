import { create } from "zustand";

/**
 * Central runtime state for the simulator engine.
 *
 * React components subscribe with selectors (cheap, re-render only on change).
 * Per-frame systems (useFrame) read via useSimulatorStore.getState() so the
 * render loop never triggers React re-renders.
 */

export type SimulatorId = "coconut" | "bench" | "idol";
export type GraphicsQuality = "Low" | "High";
export type WeatherType = "clear" | "cloudy" | "rain" | "storm" | "fog";

interface SimulatorState {
  /** Which simulator is currently loaded. null = no simulator running. */
  activeSimulator: SimulatorId | null;
  /** True while the pause menu (or settings-from-pause) is open. Freezes the frameloop. */
  paused: boolean;

  // ── Time ──────────────────────────────────────────────────────────────
  /** In-simulation time of day, in hours [0, 24). */
  timeOfDay: number;
  /** Simulation hours advanced per real-time second. 0.1 = full day in 4 minutes. */
  timeScale: number;

  // ── Weather ───────────────────────────────────────────────────────────
  weather: WeatherType;

  // ── Settings ──────────────────────────────────────────────────────────
  graphics: GraphicsQuality;

  // ── Actions ───────────────────────────────────────────────────────────
  startSimulator: (id: SimulatorId) => void;
  stopSimulator: () => void;
  setPaused: (paused: boolean) => void;
  advanceTime: (deltaSeconds: number) => void;
  setTimeOfDay: (hours: number) => void;
  setWeather: (weather: WeatherType) => void;
  setGraphics: (graphics: GraphicsQuality) => void;
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  activeSimulator: null,
  paused: false,
  timeOfDay: 10, // sims start mid-morning
  timeScale: 0.1,
  weather: "clear",
  graphics: "High",

  startSimulator: (id) =>
    set({ activeSimulator: id, paused: false, timeOfDay: 10, weather: "clear" }),
  stopSimulator: () => set({ activeSimulator: null, paused: false }),
  setPaused: (paused) => set({ paused }),
  advanceTime: (deltaSeconds) =>
    set((s) => ({
      timeOfDay: (s.timeOfDay + deltaSeconds * s.timeScale) % 24,
    })),
  setTimeOfDay: (hours) => set({ timeOfDay: ((hours % 24) + 24) % 24 }),
  setWeather: (weather) => set({ weather }),
  setGraphics: (graphics) => set({ graphics }),
}));

/** Formats a timeOfDay value (hours) as a 24h clock string, e.g. "14:32". */
export function formatTimeOfDay(timeOfDay: number): string {
  const hh = Math.floor(timeOfDay);
  const mm = Math.floor((timeOfDay - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
