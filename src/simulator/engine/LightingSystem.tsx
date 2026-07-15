import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AmbientLight, Color, DirectionalLight, HemisphereLight } from "three";
import { useSimulatorStore } from "../state/simulatorStore";
import { getDaylightFactor, getSunPosition } from "../systems/TimeSystem";

// Colour keys the sky/sun lerp between across the day/night cycle.
const SKY_DAY = new Color("#87a8c4");
const SKY_DUSK = new Color("#c47a35");
const SKY_NIGHT = new Color("#0a0d18");
const SUN_DAY = new Color("#fff4e0");
const SUN_DUSK = new Color("#ff9a4a");

const scratch = new Color();

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

  useFrame(() => {
    const { timeOfDay } = useSimulatorStore.getState();
    const daylight = getDaylightFactor(timeOfDay);
    // Approaches 1 near sunrise/sunset, 0 at noon and midnight.
    const duskiness = daylight > 0 ? 1 - Math.min(1, daylight * 2.5) : 0;

    const sun = sunRef.current;
    if (sun) {
      getSunPosition(timeOfDay, 50, sun.position);
      sun.intensity = daylight * 2.2;
      sun.color.copy(scratch.copy(SUN_DAY).lerp(SUN_DUSK, duskiness));
    }
    if (hemiRef.current) hemiRef.current.intensity = 0.15 + daylight * 0.45;
    if (ambientRef.current) ambientRef.current.intensity = 0.05 + daylight * 0.15;

    // Sky colour: night -> day, tinted towards dusk at low sun angles.
    scratch.copy(SKY_NIGHT).lerp(SKY_DAY, daylight).lerp(SKY_DUSK, duskiness * 0.45);
    if (scene.background instanceof Color) {
      scene.background.copy(scratch);
    } else {
      scene.background = scratch.clone();
    }
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
