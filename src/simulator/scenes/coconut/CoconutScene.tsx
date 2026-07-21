import { useMemo } from "react";
import { SimulatorScene } from "../SimulatorScene";
import { Beach } from "./Beach";
import { BeachAudio } from "./BeachAudio";
import { Coconut } from "./Coconut";
import { Ocean } from "./Ocean";
import { SkyLayer } from "../../effects/SkyLayer";
import { Vegetation } from "./Vegetation";
import { BeachScenery } from "./Scenery";
import { createCoconutEvents } from "./events/coconutEvents";
import { CommonActors } from "./events/CommonActors";
import { SpecialActors } from "./events/SpecialActors";

/**
 * Coconut Simulator — Tropical Coast, Latitude 8.5°N.
 *
 * You are a coconut. The camera is fixed, the world is alive, and no
 * input of any kind is required or possible.
 */
export default function CoconutScene() {
  const { channels, events } = useMemo(createCoconutEvents, []);

  return (
    <SimulatorScene
      camera={{ position: [2.7, 1.05, 3.1], target: [0, 0.35, -2.6], swayAmount: 0.05 }}
      fog={["#b8ccd4", 45, 210]}
      initialWeather="clear"
      weatherCycle
      events={events}
      object={<Coconut />}
    >
      <Beach />
      <Ocean />
      <Vegetation />
      <BeachScenery />
      <SkyLayer />
      <BeachAudio />
      <CommonActors channels={channels} />
      <SpecialActors channels={channels} />
    </SimulatorScene>
  );
}
