import type { SimulatorEvent } from "../../../systems/EventSystem";
import { channelEvent, makeChannel, type EventChannel } from "../../../systems/eventHelpers";

/**
 * The Jungle Idol event roster. Probabilities are per 5s roll (EventSystem
 * default). The jungle is quieter than the park and stranger than the
 * beach — fewer humans, more things half-seen.
 */

const CHANNEL_NAMES = [
  // common
  "butterfly",
  "monkey",
  "bird",
  "snake",
  "leafFall",
  "windShake",
  // less common
  "explorer",
  "archaeologist",
  "deer",
  "waterfall",
  "campfire",
  // rare
  "jaguar",
  "torch",
  "helicopter",
  "lostExplorer",
  "meteor",
  "glowingFigure",
] as const;

export type JungleChannels = Record<(typeof CHANNEL_NAMES)[number], EventChannel>;

export function createJungleEvents(): { channels: JungleChannels; events: SimulatorEvent[] } {
  const channels = Object.fromEntries(
    CHANNEL_NAMES.map((name) => [name, makeChannel()]),
  ) as JungleChannels;

  const events: SimulatorEvent[] = [
    // ── Common ──────────────────────────────────────────────────────────
    channelEvent(channels.butterfly, { name: "butterfly-flies-past", duration: 13, probability: 0.22, cooldown: 25 }),
    channelEvent(channels.monkey, { name: "monkey-swings-through", duration: 9, probability: 0.16, cooldown: 35 }),
    channelEvent(channels.bird, { name: "bird-lands-nearby", duration: 15, probability: 0.18, cooldown: 30 }),
    channelEvent(channels.snake, { name: "snake-crosses-path", duration: 12, probability: 0.12, cooldown: 50 }),
    channelEvent(channels.leafFall, { name: "leaves-fall", duration: 10, probability: 0.22, cooldown: 25 }),
    channelEvent(channels.windShake, { name: "wind-shakes-canopy", duration: 8, probability: 0.2, cooldown: 30 }),
    // ── Less common ─────────────────────────────────────────────────────
    channelEvent(channels.explorer, { name: "explorer-walks-past", duration: 18, probability: 0.05, cooldown: 120 }),
    channelEvent(channels.archaeologist, { name: "archaeologist-studies-ruins", duration: 40, probability: 0.04, cooldown: 220 }),
    channelEvent(channels.deer, { name: "deer-appears", duration: 16, probability: 0.05, cooldown: 120 }),
    channelEvent(channels.waterfall, { name: "waterfall-through-the-mist", duration: 30, probability: 0.04, cooldown: 200 }),
    channelEvent(channels.campfire, { name: "smoke-in-the-distance", duration: 45, probability: 0.035, cooldown: 240 }),
    // ── Rare ────────────────────────────────────────────────────────────
    channelEvent(channels.jaguar, { name: "jaguar-passes", duration: 12, probability: 0.012, cooldown: 300 }),
    channelEvent(channels.torch, { name: "torch-lights-itself", duration: 20, probability: 0.008, cooldown: 420 }),
    channelEvent(channels.helicopter, { name: "helicopter-overhead", duration: 14, probability: 0.01, cooldown: 360 }),
    channelEvent(channels.lostExplorer, { name: "lost-explorer-runs", duration: 6, probability: 0.01, cooldown: 300 }),
    channelEvent(channels.meteor, { name: "meteor-streaks-past", duration: 3, probability: 0.008, cooldown: 360 }),
    channelEvent(channels.glowingFigure, { name: "figure-behind-the-ruins", duration: 11, probability: 0.006, cooldown: 480 }),
  ];

  return { channels, events };
}
