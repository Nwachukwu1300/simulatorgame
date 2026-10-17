import { Suspense, useEffect } from "react";
import { useProgress } from "@react-three/drei";
import { SIMULATOR_REGISTRY } from "../registry";
import { useSimulatorStore, type SimulatorId } from "../state/simulatorStore";

/**
 * EnvironmentLoader — resolves a simulator id to its scene and suspends
 * while the code-split chunk (and, later, its 3D assets) load.
 *
 * The DOM loading screen covers the canvas during this window, so the
 * fallback stays empty.
 */
export function EnvironmentLoader({ simulatorId }: { simulatorId: SimulatorId }) {
  const Scene = SIMULATOR_REGISTRY[simulatorId].scene;
  return (
    <>
      <LoadTracker />
      <Suspense fallback={null}>
        <Scene />
        <SceneReady />
      </Suspense>
    </>
  );
}

/** Publishes asset loading progress to the store for the DOM loading screen. */
function LoadTracker() {
  const { active, progress } = useProgress();
  useEffect(() => useSimulatorStore.getState().setAssetLoad(active, progress), [active, progress]);
  return null;
}

/** Mounts only once the Suspense boundary resolves, i.e. the scene is in. */
function SceneReady() {
  useEffect(() => useSimulatorStore.getState().setSceneReady(true), []);
  return null;
}
