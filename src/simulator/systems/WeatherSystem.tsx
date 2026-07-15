import { useEffect } from "react";
import { useSimulatorStore, type WeatherType } from "../state/simulatorStore";

/**
 * WeatherSystem — foundation for environmental weather (Stage 3).
 *
 * Weather state lives in the simulator store so the HUD, LightingSystem
 * and future effects (rain particles, fog density, wind audio) can all
 * react to it. Stage 4+ will add the actual visual effects per type;
 * this component is where they will mount.
 */
export function WeatherSystem({ initial = "clear" }: { initial?: WeatherType }) {
  useEffect(() => {
    useSimulatorStore.getState().setWeather(initial);
  }, [initial]);

  const weather = useSimulatorStore((s) => s.weather);

  switch (weather) {
    // Future: return <RainEffect />, <FogEffect />, <StormEffect /> etc.
    case "rain":
    case "storm":
    case "fog":
    case "cloudy":
    case "clear":
    default:
      return null;
  }
}
