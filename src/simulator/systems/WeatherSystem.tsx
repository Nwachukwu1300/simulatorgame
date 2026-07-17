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

export type WeatherWeights = [WeatherType, number][];

const DEFAULT_WEIGHTS: WeatherWeights = [
  ["clear", 0.45],
  ["cloudy", 0.3],
  ["rain", 0.18],
  ["storm", 0.07],
];

function pickNextWeather(current: WeatherType, weights: WeatherWeights): WeatherType {
  let r = Math.random();
  for (const [type, weight] of weights) {
    r -= weight;
    if (r <= 0) return type === current ? "clear" : type;
  }
  return "clear";
}

export function WeatherSystem({
  initial = "clear",
  autoCycle = false,
  weights = DEFAULT_WEIGHTS,
}: {
  initial?: WeatherType;
  autoCycle?: boolean;
  /** Per-scene weather distribution (e.g. the jungle adds fog). */
  weights?: WeatherWeights;
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
      setWeather(pickNextWeather(weather, weights));
    }
  });

  const weather = useSimulatorStore((s) => s.weather);
  return weather === "rain" || weather === "storm" ? <RainEffect /> : null;
}
