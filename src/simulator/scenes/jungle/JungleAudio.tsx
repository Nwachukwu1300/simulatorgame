import { useRef } from "react";
import { useAmbience } from "../../systems/ambience";
import { birdChirp, monkeyCall } from "../../engine/proceduralAudio";
import type { EventChannel } from "../../systems/eventHelpers";

const BEDS = {
  insects: { frequency: 6200, q: 9, lfoRate: 5.5, lfoDepth: 0.55 }, // daytime cicadas
  wind: { frequency: 700, q: 0.5, lfoRate: 0.05, lfoDepth: 0.6 },
  canopy: { frequency: 1700, q: 1.2, lfoRate: 0.18, lfoDepth: 0.7 }, // leaves overhead
  water: { frequency: 880, q: 0.6, lfoRate: 0.13, lfoDepth: 0.25 }, // stream, out of sight
  rain: { frequency: 3200, q: 0.3 },
  night: { frequency: 4600, q: 8, lfoRate: 11, lfoDepth: 0.8 },
};

/**
 * Jungle soundscape (all procedural — see proceduralAudio.ts):
 * - Cicadas by day, a denser insect chorus by night.
 * - Wind + canopy rustle, boosted while the windShake event gusts.
 * - A stream somewhere beyond the ruins, always.
 * - Exotic birds; distant monkeys, occasionally.
 * - Rain drums harder here — a canopy is a drum skin.
 * Thunder is fired by the storm lightning in the shared RainEffect.
 */
export function JungleAudio({ gust }: { gust?: EventChannel }) {
  const nextChirp = useRef(4);
  const nextMonkey = useRef(15);

  useAmbience(BEDS, ({ daylight, storminess, weather, delta }, setLevel) => {
    const gusting = gust?.active ? Math.sin(gust.progress * Math.PI) : 0;

    setLevel("insects", storminess === 0 ? daylight * 0.05 : 0);
    setLevel("wind", 0.05 + storminess * 0.22 + gusting * 0.18);
    setLevel("canopy", 0.06 + storminess * 0.16 + gusting * 0.22 + (weather === "cloudy" ? 0.03 : 0));
    setLevel("water", 0.05);
    setLevel("rain", storminess * 0.45);
    setLevel("night", daylight < 0.05 && storminess === 0 ? 0.06 : 0);

    // Exotic birdsong in daylight, silent in rain/storm
    if (daylight > 0.15 && storminess === 0) {
      nextChirp.current -= delta;
      if (nextChirp.current <= 0) {
        nextChirp.current = 3 + Math.random() * 8;
        birdChirp(0.06 + Math.random() * 0.05);
      }
    }

    // Howls from somewhere in the green. Not close. Probably.
    if (daylight > 0.08 && storminess === 0) {
      nextMonkey.current -= delta;
      if (nextMonkey.current <= 0) {
        nextMonkey.current = 25 + Math.random() * 45;
        monkeyCall();
      }
    }
  });

  return null;
}
