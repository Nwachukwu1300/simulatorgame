import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { SimulatorId } from "./state/simulatorStore";

export interface SimulatorDefinition {
  id: SimulatorId;
  name: string;
  /** Lazy-loaded so each environment becomes its own code-split chunk. */
  scene: LazyExoticComponent<ComponentType>;
}

// Idol still resolves to the Stage 3 TestScene until its stage lands.
const TestScene = () => import("./scenes/TestScene");

export const SIMULATOR_REGISTRY: Record<SimulatorId, SimulatorDefinition> = {
  coconut: {
    id: "coconut",
    name: "Coconut Simulator",
    scene: lazy(() => import("./scenes/coconut/CoconutScene")),
  },
  bench: {
    id: "bench",
    name: "Bench Simulator",
    scene: lazy(() => import("./scenes/bench/BenchScene")),
  },
  idol: { id: "idol", name: "Jungle Idol Simulator", scene: lazy(TestScene) },
};
