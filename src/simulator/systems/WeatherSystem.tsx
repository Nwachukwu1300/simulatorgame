import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSimulatorStore, type WeatherType } from "../state/simulatorStore";
import { RainEffect } from "../effects/Rain";

/**
 * WeatherSystem — owns the weather state and mounts weather effects.
 *
 * With `autoCycle`, weather drifts naturally over time (weighted toward
 * fair conditions). Rain/storm mount the shared RainEffect; the
 * LightingSystem independently dims the sun for overcast weather and the
 * scene's audio reacts through the store.
 */

const CYCLE_WEIGHTS: [WeatherType, number][] = [
  ["clear", 0.45],
  ["cloudy", 0.3],
  ["rain", 0.18],
  ["storm", 0.07],
];

function pickNextWeather(current: WeatherType): WeatherType {
  let r = Math.random();
  for (const [type, weight] of CYCLE_WEIGHTS) {
    r -= weight;
    if (r <= 0) return type === current ? "clear" : type;
  }
  return "clear";
}

export function WeatherSystem({
  initial = "clear",
  autoCycle = false,
}: {
  initial?: WeatherType;
  autoCycle?: boolean;
}) {
  const untilChange = useRef(50 + Math.random() * 60);

  useEffect(() => {
    useSimulatorStore.getState().setWeather(initial);
  }, [initial]);

  useFrame((_, delta) => {
    if (!autoCycle) return;
    const { paused, weather, setWeather } = useSimulatorStore.getState();
    if (paused) return;
    untilChange.current -= delta;
    if (untilChange.current <= 0) {
      untilChange.current = 60 + Math.random() * 90;
      setWeather(pickNextWeather(weather));
    }
  });

  const weather = useSimulatorStore((s) => s.weather);
  return weather === "rain" || weather === "storm" ? <RainEffect /> : null;
}
