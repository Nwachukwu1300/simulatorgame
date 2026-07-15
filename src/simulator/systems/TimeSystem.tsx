import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { useSimulatorStore } from "../state/simulatorStore";

/**
 * TimeSystem — advances the in-simulation clock every frame.
 *
 * Foundation for the day/night cycle (Stage 3) and future weather
 * transitions. Time is stored centrally so the HUD, LightingSystem and
 * future systems all read the same clock.
 *
 * Mount once per SimulatorCanvas. Renders nothing.
 */
export function TimeSystem() {
  useFrame((_, delta) => {
    const { paused, advanceTime } = useSimulatorStore.getState();
    if (!paused) advanceTime(delta);
  });
  return null;
}

/**
 * Computes the sun's position on its arc for a given time of day.
 * Sunrise ~06:00 (east), noon overhead, sunset ~18:00 (west).
 * Below the horizon at night (negative Y).
 */
export function getSunPosition(
  timeOfDay: number,
  radius = 50,
  out: Vector3 = new Vector3(),
): Vector3 {
  const angle = ((timeOfDay - 6) / 24) * Math.PI * 2;
  out.set(
    Math.cos(angle) * radius,
    Math.sin(angle) * radius,
    radius * 0.35, // slight tilt so shadows are never perfectly vertical
  );
  return out;
}

/** 0 at night, 1 at high noon. Used to fade light intensity and sky colour. */
export function getDaylightFactor(timeOfDay: number): number {
  const angle = ((timeOfDay - 6) / 24) * Math.PI * 2;
  return Math.max(0, Math.sin(angle));
}
