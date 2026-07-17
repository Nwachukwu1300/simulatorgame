import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useSimulatorStore, type WeatherType } from "../state/simulatorStore";
import { getDaylightFactor } from "./TimeSystem";
import { ensureAmbientBed, setAmbientLevel, stopAllBeds } from "../engine/proceduralAudio";

export interface BedConfig {
  frequency: number;
  q: number;
  lfoRate?: number;
  lfoDepth?: number;
}

export interface AmbienceFrame {
  /** 0 at night, 1 at noon. */
  daylight: number;
  /** 1 in a storm, 0.6 in rain, 0 otherwise. */
  storminess: number;
  weather: WeatherType;
  timeOfDay: number;
  /** Seconds since last frame — for scheduling one-shots. */
  delta: number;
}

/**
 * Shared soundscape driver (extracted in Stage 6 — Beach/Park/Jungle audio
 * only differ in bed configs and level curves).
 *
 * Ensures every bed exists (lazily, so they appear once the AudioContext
 * unlocks), silences everything while paused, stops all beds on unmount,
 * and calls `onFrame` with the derived time/weather factors so the scene
 * can set levels and fire one-shots.
 */
export function useAmbience(
  beds: Record<string, BedConfig>,
  onFrame: (frame: AmbienceFrame, setLevel: (name: string, level: number) => void) => void,
): void {
  useEffect(() => stopAllBeds, []);

  useFrame((_, delta) => {
    const { paused, timeOfDay, weather } = useSimulatorStore.getState();

    for (const [name, config] of Object.entries(beds)) ensureAmbientBed(name, config);

    if (paused) {
      for (const name of Object.keys(beds)) setAmbientLevel(name, 0);
      return;
    }

    const daylight = getDaylightFactor(timeOfDay);
    const storminess = weather === "storm" ? 1 : weather === "rain" ? 0.6 : 0;
    onFrame({ daylight, storminess, weather, timeOfDay, delta }, setAmbientLevel);
  });
}
