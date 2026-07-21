import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, VSMShadowMap, SRGBColorSpace } from "three";
import { useSimulatorStore, type SimulatorId } from "../state/simulatorStore";
import { AudioSystem } from "./AudioSystem";
import { EnvironmentLoader } from "./EnvironmentLoader";
import { LightingSystem } from "./LightingSystem";
import { TimeSystem } from "../systems/TimeSystem";
import { PostProcessingEffects } from "./PostProcessingEffects";

/**
 * SimulatorCanvas — the single Three.js surface for the whole game.
 *
 * Mounted once behind the DOM UI while a simulator is active, and kept
 * alive across HUD <-> pause <-> settings so the WebGL context is never
 * recreated. Resizing is handled automatically by react-three-fiber
 * (the canvas tracks its parent element's size).
 *
 * Rendering quality is driven by the Graphics setting:
 *   High → retina dpr, antialiasing, shadows
 *   Low  → dpr 1, no AA, no shadows
 *
 * While paused, the frameloop switches to "demand": the picture freezes,
 * matching the design brief ("background freezes and dims").
 */
export function SimulatorCanvas({ simulatorId }: { simulatorId: SimulatorId }) {
  const graphics = useSimulatorStore((s) => s.graphics);
  const paused = useSimulatorStore((s) => s.paused);
  const high = graphics === "High";

  return (
    <Canvas
      // key remount on quality change keeps gl settings (AA) consistent
      key={graphics}
      shadows={high ? { type: VSMShadowMap } : false}
      dpr={high ? [1, 2] : 1}
      frameloop={paused ? "demand" : "always"}
      camera={{ fov: 45, near: 0.1, far: 250, position: [3.2, 1.6, 4.2] }}
      gl={{
        antialias: high,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        outputColorSpace: SRGBColorSpace,
        powerPreference: "high-performance",
      }}
    >
      <TimeSystem />
      <LightingSystem />
      <AudioSystem />
      <EnvironmentLoader simulatorId={simulatorId} />
      {high && <PostProcessingEffects />}
    </Canvas>
  );
}
