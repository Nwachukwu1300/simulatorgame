import { useRef } from "react";
import { useAmbience } from "../../systems/ambience";
import { birdChirp, dogBark } from "../../engine/proceduralAudio";

const BEDS = {
  wind: { frequency: 700, q: 0.5, lfoRate: 0.05, lfoDepth: 0.6 },
  leaves: { frequency: 1900, q: 1.4, lfoRate: 0.22, lfoDepth: 0.7 },
  traffic: { frequency: 150, q: 0.6, lfoRate: 0.07, lfoDepth: 0.3 },
  chatter: { frequency: 1050, q: 3.5, lfoRate: 0.35, lfoDepth: 0.8 },
  rain: { frequency: 3200, q: 0.3 },
  night: { frequency: 4600, q: 8, lfoRate: 11, lfoDepth: 0.8 },
};

/**
 * Park soundscape (all procedural — see proceduralAudio.ts):
 * - Wind + rustling leaves: always on, stronger in bad weather.
 * - Distant traffic: constant low murmur from beyond the fence.
 * - Children/people chatter: faint, daytime + fair weather only.
 * - Birds: sparse chirps in daylight; a distant dog barks occasionally.
 * - Rain bed + night insects: conditional.
 * Thunder is fired by the storm lightning in the shared RainEffect.
 */
export function ParkAudio() {
  const nextChirp = useRef(3);
  const nextBark = useRef(20);

  useAmbience(BEDS, ({ daylight, storminess, weather, delta }, setLevel) => {
    setLevel("wind", 0.07 + storminess * 0.25 + (weather === "cloudy" ? 0.05 : 0));
    setLevel("leaves", 0.06 + storminess * 0.14 + (weather === "cloudy" ? 0.04 : 0));
    setLevel("traffic", 0.03 + daylight * 0.05);
    setLevel("chatter", storminess === 0 ? daylight * 0.05 : 0);
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

    // A dog, somewhere, has opinions. Daytime only.
    if (daylight > 0.1 && storminess < 1) {
      nextBark.current -= delta;
      if (nextBark.current <= 0) {
        nextBark.current = 30 + Math.random() * 50;
        dogBark(0.05);
      }
    }
  });

  return null;
}
