import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSimulatorStore } from "../../state/simulatorStore";
import { getDaylightFactor } from "../../systems/TimeSystem";
import {
  birdChirp,
  ensureAmbientBed,
  setAmbientLevel,
  stopAllBeds,
} from "../../engine/proceduralAudio";

/**
 * Beach soundscape (all procedural — see proceduralAudio.ts):
 * - Ocean waves: always on, swelling slowly.
 * - Wind: always on, gustier in bad weather.
 * - Birds: sparse chirps, daytime + fair weather only.
 * - Rain bed + night insects: conditional.
 * Thunder is fired by the storm lightning in RainEffect.
 */
export function BeachAudio() {
  const nextChirp = useRef(3);

  useEffect(() => stopAllBeds, []);

  useFrame((_, delta) => {
    const { paused, timeOfDay, weather } = useSimulatorStore.getState();

    // Beds are created lazily so they exist once the AudioContext unlocks.
    ensureAmbientBed("ocean", { frequency: 240, q: 0.4, lfoRate: 0.09, lfoDepth: 0.45 });
    ensureAmbientBed("wind", { frequency: 700, q: 0.5, lfoRate: 0.05, lfoDepth: 0.6 });
    ensureAmbientBed("rain", { frequency: 3200, q: 0.3 });
    ensureAmbientBed("night", { frequency: 4600, q: 8, lfoRate: 11, lfoDepth: 0.8 });

    if (paused) {
      for (const bed of ["ocean", "wind", "rain", "night"]) setAmbientLevel(bed, 0);
      return;
    }

    const daylight = getDaylightFactor(timeOfDay);
    const storminess = weather === "storm" ? 1 : weather === "rain" ? 0.6 : 0;

    setAmbientLevel("ocean", 0.32 + storminess * 0.18);
    setAmbientLevel("wind", 0.1 + storminess * 0.25 + (weather === "cloudy" ? 0.06 : 0));
    setAmbientLevel("rain", storminess * 0.4);
    setAmbientLevel("night", daylight < 0.05 && storminess === 0 ? 0.045 : 0);

    // Sparse birdsong in daylight, silent in rain/storm
    if (daylight > 0.15 && storminess === 0) {
      nextChirp.current -= delta;
      if (nextChirp.current <= 0) {
        nextChirp.current = 4 + Math.random() * 9;
        birdChirp();
      }
    }
  });

  return null;
}
