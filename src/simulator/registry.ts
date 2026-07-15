import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { SimulatorId } from "./state/simulatorStore";

export interface SimulatorDefinition {
  id: SimulatorId;
  name: string;
  /** Lazy-loaded so each environment becomes its own code-split chunk. */
  scene: LazyExoticComponent<ComponentType>;
}

// Stage 3: every simulator resolves to the temporary TestScene.
// Stages 4-7 replace these with the real environments, e.g.:
//   scene: lazy(() => import("./scenes/coconut/BeachScene"))
const TestScene = () => import("./scenes/TestScene");

export const SIMULATOR_REGISTRY: Record<SimulatorId, SimulatorDefinition> = {
  coconut: { id: "coconut", name: "Coconut Simulator", scene: lazy(TestScene) },
  bench: { id: "bench", name: "Bench Simulator", scene: lazy(TestScene) },
  idol: { id: "idol", name: "Jungle Idol Simulator", scene: lazy(TestScene) },
};
