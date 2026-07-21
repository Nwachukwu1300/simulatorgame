import { useMemo } from "react";
import { SimulatorScene } from "../SimulatorScene";
import { SkyLayer } from "../../effects/SkyLayer";
import type { WeatherWeights } from "../../systems/WeatherSystem";
import { Atmosphere } from "./Atmosphere";
import { Ground } from "./Ground";
import { Idol } from "./Idol";
import { JungleAudio } from "./JungleAudio";
import { JungleScenery } from "./JungleScenery";
import { Mountains } from "./Mountains";
import { Ruins } from "./Ruins";
import { Vegetation } from "./Vegetation";
import { createJungleEvents } from "./events/jungleEvents";
import { CommonActors } from "./events/CommonActors";
import { SpecialActors } from "./events/SpecialActors";

/**
 * Jungle Idol Simulator — The Forgotten Temple, Estimated Age: 2,400 Years.
 *
 * You are an idol. Explorers pass, mist gathers, the jungle keeps its own
 * counsel. You were worshipped once. Now you are simply present.
 *
 * The jungle rolls fog into its weather cycle — the only scene that does.
 */
const WEATHER_WEIGHTS: WeatherWeights = [
  ["clear", 0.4],
  ["fog", 0.22],
  ["cloudy", 0.15],
  ["rain", 0.16],
  ["storm", 0.07],
];

export default function JungleScene() {
  const { channels, events } = useMemo(createJungleEvents, []);

  return (
    <SimulatorScene
      camera={{ position: [2.9, 1.4, 4.2], target: [0, 1.0, 0.2], swayAmount: 0.04 }}
      fog={["#4f5c48", 12, 110]}
      initialWeather="clear"
      weatherCycle
      weatherWeights={WEATHER_WEIGHTS}
      events={events}
      object={<Idol />}
    >
      <Ground />
      <Vegetation gust={channels.windShake} />
      <Ruins />
      <JungleScenery />
      <Mountains />
      <SkyLayer />
      <Atmosphere />
      <JungleAudio gust={channels.windShake} />
      <CommonActors channels={channels} />
      <SpecialActors channels={channels} />
    </SimulatorScene>
  );
}
