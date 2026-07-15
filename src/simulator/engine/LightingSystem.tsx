import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AmbientLight, Color, DirectionalLight, Fog, HemisphereLight } from "three";
import { useSimulatorStore, type WeatherType } from "../state/simulatorStore";
import { getDaylightFactor, getSunPosition } from "../systems/TimeSystem";

// Colour keys the sky/sun lerp between across the day/night cycle.
const SKY_DAY = new Color("#87a8c4");
const SKY_DUSK = new Color("#c47a35");
const SKY_NIGHT = new Color("#0a0d18");
const SUN_DAY = new Color("#fff4e0");
const SUN_DUSK = new Color("#ff9a4a");

const OVERCAST = new Color("#6e7681");
const scratch = new Color();

/** How much each weather type dims the sun and greys the sky. */
const WEATHER_DIM: Record<WeatherType, number> = {
  clear: 1,
  cloudy: 0.6,
  rain: 0.4,
  storm: 0.28,
  fog: 0.55,
};

/**
 * LightingSystem — shared lighting rig used by every simulator.
 *
 * - Directional "sun" light driven by the TimeSystem clock (position,
 *   intensity and colour follow the time of day).
 * - Hemisphere + ambient fill so night scenes never go fully black.
 * - Scene background colour lerps between day, dusk and night.
 *
 * Lights are mutated inside useFrame (no React re-renders per frame).
 */
export function LightingSystem() {
  const sunRef = useRef<DirectionalLight>(null);
  const hemiRef = useRef<HemisphereLight>(null);
  const ambientRef = useRef<AmbientLight>(null);
  const scene = useThree((s) => s.scene);
  const dim = useRef(1);

  useFrame((_, delta) => {
    const { timeOfDay, weather } = useSimulatorStore.getState();
    const daylight = getDaylightFactor(timeOfDay);
    // Approaches 1 near sunrise/sunset, 0 at noon and midnight.
    const duskiness = daylight > 0 ? 1 - Math.min(1, daylight * 2.5) : 0;

    // Ease toward the current weather's dim factor so changes feel gradual.
    dim.current += (WEATHER_DIM[weather] - dim.current) * Math.min(1, delta * 0.5);
    const d = dim.current;

    const sun = sunRef.current;
    if (sun) {
      getSunPosition(timeOfDay, 50, sun.position);
      sun.intensity = daylight * 2.2 * d;
      sun.color.copy(scratch.copy(SUN_DAY).lerp(SUN_DUSK, duskiness));
    }
    if (hemiRef.current) hemiRef.current.intensity = (0.15 + daylight * 0.45) * (0.5 + d * 0.5);
    if (ambientRef.current) ambientRef.current.intensity = 0.05 + daylight * 0.15;

    // Sky colour: night -> day, dusk-tinted at low sun, greyed when overcast.
    scratch
      .copy(SKY_NIGHT)
      .lerp(SKY_DAY, daylight)
      .lerp(SKY_DUSK, duskiness * 0.45 * d)
      .lerp(OVERCAST, (1 - d) * daylight * 0.8);
    if (scene.background instanceof Color) {
      scene.background.copy(scratch);
    } else {
      scene.background = scratch.clone();
    }
    // Keep fog matched to the sky so the horizon stays seamless.
    if (scene.fog instanceof Fog) scene.fog.color.copy(scratch);
  });

  return (
    <>
      <directionalLight
        ref={sunRef}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <hemisphereLight ref={hemiRef} args={["#b8c8dc", "#3a3028"]} />
      <ambientLight ref={ambientRef} />
    </>
  );
}
