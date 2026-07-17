import { useRef } from "react";
import { useAmbience } from "../../systems/ambience";
import { birdChirp } from "../../engine/proceduralAudio";

const BEDS = {
  ocean: { frequency: 240, q: 0.4, lfoRate: 0.09, lfoDepth: 0.45 },
  wind: { frequency: 700, q: 0.5, lfoRate: 0.05, lfoDepth: 0.6 },
  rain: { frequency: 3200, q: 0.3 },
  night: { frequency: 4600, q: 8, lfoRate: 11, lfoDepth: 0.8 },
};

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

  useAmbience(BEDS, ({ daylight, storminess, weather, delta }, setLevel) => {
    setLevel("ocean", 0.32 + storminess * 0.18);
    setLevel("wind", 0.1 + storminess * 0.25 + (weather === "cloudy" ? 0.06 : 0));
    setLevel("rain", storminess * 0.4);
    setLevel("night", daylight < 0.05 && storminess === 0 ? 0.045 : 0);

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
