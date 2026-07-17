import type { ReactNode } from "react";
import { CameraController, type CameraControllerProps } from "../engine/CameraController";
import { EventSystem, type SimulatorEvent } from "../systems/EventSystem";
import { WeatherSystem, type WeatherWeights } from "../systems/WeatherSystem";
import type { WeatherType } from "../state/simulatorStore";

export interface SimulatorSceneProps {
  /** Environment content: terrain, water, vegetation, props, effects... */
  children?: ReactNode;
  /** The main simulator object (wrapped in <SimulatorObject>). */
  object?: ReactNode;
  /** Fixed camera framing for this simulator. */
  camera?: CameraControllerProps;
  /** Scripted background events for this environment. */
  events?: SimulatorEvent[];
  /** Weather the scene starts with. */
  initialWeather?: WeatherType;
  /** Let the weather drift naturally over time. */
  weatherCycle?: boolean;
  /** Per-scene weather distribution for the cycle. */
  weatherWeights?: WeatherWeights;
  /** Fog for atmosphere/draw-distance masking: [color, near, far]. */
  fog?: [string, number, number];
}

/**
 * SimulatorScene — the base every simulator extends.
 *
 * A simulator is just this component configured with an environment,
 * an object and events:
 *
 *   Coconut Simulator: beach environment + coconut object
 *   Bench Simulator:   park environment + bench object
 *   Jungle Simulator:  jungle environment + idol object
 *
 * Shared engine concerns (clock, sun, audio listener, canvas settings)
 * live one level up in SimulatorCanvas — scenes only describe what is
 * unique to them.
 */
export function SimulatorScene({
  children,
  object,
  camera,
  events = [],
  initialWeather = "clear",
  weatherCycle = false,
  weatherWeights,
  fog,
}: SimulatorSceneProps) {
  return (
    <>
      <CameraController {...camera} />
      <WeatherSystem initial={initialWeather} autoCycle={weatherCycle} weights={weatherWeights} />
      <EventSystem events={events} />
      {fog && <fog attach="fog" args={fog} />}
      {children}
      {object}
    </>
  );
}
