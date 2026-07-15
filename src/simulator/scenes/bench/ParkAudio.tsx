import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSimulatorStore } from "../../state/simulatorStore";
import { getDaylightFactor } from "../../systems/TimeSystem";
import {
  birdChirp,
  dogBark,
  ensureAmbientBed,
  setAmbientLevel,
  stopAllBeds,
} from "../../engine/proceduralAudio";

const BEDS = ["wind", "leaves", "traffic", "chatter", "rain", "night"] as const;

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

  useEffect(() => stopAllBeds, []);

  useFrame((_, delta) => {
    const { paused, timeOfDay, weather } = useSimulatorStore.getState();

    // Beds are created lazily so they exist once the AudioContext unlocks.
    ensureAmbientBed("wind", { frequency: 700, q: 0.5, lfoRate: 0.05, lfoDepth: 0.6 });
    ensureAmbientBed("leaves", { frequency: 1900, q: 1.4, lfoRate: 0.22, lfoDepth: 0.7 });
    ensureAmbientBed("traffic", { frequency: 150, q: 0.6, lfoRate: 0.07, lfoDepth: 0.3 });
    ensureAmbientBed("chatter", { frequency: 1050, q: 3.5, lfoRate: 0.35, lfoDepth: 0.8 });
    ensureAmbientBed("rain", { frequency: 3200, q: 0.3 });
    ensureAmbientBed("night", { frequency: 4600, q: 8, lfoRate: 11, lfoDepth: 0.8 });

    if (paused) {
      for (const bed of BEDS) setAmbientLevel(bed, 0);
      return;
    }

    const daylight = getDaylightFactor(timeOfDay);
    const storminess = weather === "storm" ? 1 : weather === "rain" ? 0.6 : 0;

    setAmbientLevel("wind", 0.07 + storminess * 0.25 + (weather === "cloudy" ? 0.05 : 0));
    setAmbientLevel("leaves", 0.06 + storminess * 0.14 + (weather === "cloudy" ? 0.04 : 0));
    setAmbientLevel("traffic", 0.03 + daylight * 0.05);
    setAmbientLevel("chatter", storminess === 0 ? daylight * 0.05 : 0);
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
