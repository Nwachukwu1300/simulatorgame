import { useMemo } from "react";
import { SimulatorScene } from "../SimulatorScene";
import { SkyLayer } from "../../effects/SkyLayer";
import { Bench } from "./Bench";
import { Buildings } from "./Buildings";
import { FallingLeaves } from "./FallingLeaves";
import { Ground } from "./Ground";
import { ParkAudio } from "./ParkAudio";
import { ParkProps } from "./ParkProps";
import { createBenchEvents } from "./events/benchEvents";
import { CommonActors } from "./events/CommonActors";
import { SpecialActors } from "./events/SpecialActors";

/**
 * Bench Simulator — Meridian Park, Autumn, Year Four.
 *
 * You are a bench. People pass, seasons turn, and your dedication plaque
 * remains legible. Nothing is asked of you. Nothing ever will be.
 */
export default function BenchScene() {
  const { channels, events } = useMemo(createBenchEvents, []);

  return (
    <SimulatorScene
      camera={{ position: [3.4, 1.6, 4.9], target: [0, 0.7, 0.3], swayAmount: 0.045 }}
      fog={["#b3ac9e", 35, 160]}
      initialWeather="clear"
      weatherCycle
      events={events}
      object={<Bench />}
    >
      <Ground />
      <ParkProps />
      <Buildings />
      <FallingLeaves />
      <SkyLayer />
      <ParkAudio />
      <CommonActors channels={channels} />
      <SpecialActors channels={channels} />
    </SimulatorScene>
  );
}
