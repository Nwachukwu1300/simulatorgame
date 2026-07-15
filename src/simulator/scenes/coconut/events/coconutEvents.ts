import type { SimulatorEvent } from "../../../systems/EventSystem";
import { channelEvent, makeChannel, type EventChannel } from "./helpers";

/**
 * The Coconut Simulator event roster. Probabilities are per 5s roll
 * (EventSystem default), so p=0.25 ≈ one occurrence every ~20s once off
 * cooldown. Rare events are tuned to be genuinely rare.
 */

const CHANNEL_NAMES = [
  // common
  "crab",
  "seagull",
  "shoreWave",
  "fish",
  "fallingCoconut",
  "beachBall",
  // medium
  "tourist",
  "photographer",
  "boat",
  "sandcastle",
  // rare
  "pirateShip",
  "ufo",
  "strangeRunner",
  "giantWave",
] as const;

export type CoconutChannels = Record<(typeof CHANNEL_NAMES)[number], EventChannel>;

export function createCoconutEvents(): { channels: CoconutChannels; events: SimulatorEvent[] } {
  const channels = Object.fromEntries(
    CHANNEL_NAMES.map((name) => [name, makeChannel()]),
  ) as CoconutChannels;

  const events: SimulatorEvent[] = [
    // ── Common ──────────────────────────────────────────────────────────
    channelEvent(channels.crab, { name: "crab-walks-past", duration: 14, probability: 0.22, cooldown: 30 }),
    channelEvent(channels.seagull, { name: "seagull-flies-overhead", duration: 9, probability: 0.2, cooldown: 25 }),
    channelEvent(channels.shoreWave, { name: "wave-reaches-coconut", duration: 7, probability: 0.28, cooldown: 20 }),
    channelEvent(channels.fish, { name: "fish-jumps", duration: 2.2, probability: 0.18, cooldown: 25 }),
    channelEvent(channels.fallingCoconut, { name: "coconut-falls-nearby", duration: 8, probability: 0.08, cooldown: 90 }),
    channelEvent(channels.beachBall, { name: "beach-ball-rolls-past", duration: 11, probability: 0.1, cooldown: 60 }),
    // ── Medium ──────────────────────────────────────────────────────────
    channelEvent(channels.tourist, { name: "tourist-walks-through", duration: 16, probability: 0.07, cooldown: 60 }),
    channelEvent(channels.photographer, { name: "person-takes-photo", duration: 14, probability: 0.05, cooldown: 120 }),
    channelEvent(channels.boat, { name: "boat-passes", duration: 35, probability: 0.06, cooldown: 90 }),
    channelEvent(channels.sandcastle, { name: "sandcastle-appears", duration: 30, probability: 0.035, cooldown: 240 }),
    // ── Rare ────────────────────────────────────────────────────────────
    channelEvent(channels.pirateShip, { name: "pirate-ship-offshore", duration: 50, probability: 0.012, cooldown: 300 }),
    channelEvent(channels.ufo, { name: "ufo-crosses-sky", duration: 9, probability: 0.008, cooldown: 360 }),
    channelEvent(channels.strangeRunner, { name: "strange-character-runs", duration: 3.5, probability: 0.01, cooldown: 300 }),
    channelEvent(channels.giantWave, { name: "giant-wave", duration: 13, probability: 0.007, cooldown: 420 }),
  ];

  return { channels, events };
}
