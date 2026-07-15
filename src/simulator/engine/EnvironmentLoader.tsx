import { Suspense } from "react";
import { SIMULATOR_REGISTRY } from "../registry";
import type { SimulatorId } from "../state/simulatorStore";

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
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  );
}
