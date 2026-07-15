import type { SimulatorEvent } from "../../../systems/EventSystem";
import { channelEvent, makeChannel, type EventChannel } from "../../../systems/eventHelpers";

/**
 * The Bench Simulator event roster. Probabilities are per 5s roll
 * (EventSystem default), so p=0.2 ≈ one occurrence every ~25s once off
 * cooldown. A park is busier than a beach, but rare events stay rare.
 */

const CHANNEL_NAMES = [
  // common
  "jogger",
  "dog",
  "cyclist",
  "couple",
  "football",
  "squirrel",
  "pigeons",
  // less common
  "iceCreamVan",
  "groundskeeper",
  "musician",
  "photographer",
  // rare
  "wedding",
  "marathon",
  "flashMob",
  "movieCrew",
  "bananaRunner",
] as const;

export type BenchChannels = Record<(typeof CHANNEL_NAMES)[number], EventChannel>;

export function createBenchEvents(): { channels: BenchChannels; events: SimulatorEvent[] } {
  const channels = Object.fromEntries(
    CHANNEL_NAMES.map((name) => [name, makeChannel()]),
  ) as BenchChannels;

  const events: SimulatorEvent[] = [
    // ── Common ──────────────────────────────────────────────────────────
    channelEvent(channels.jogger, { name: "jogger-passes", duration: 10, probability: 0.22, cooldown: 25 }),
    channelEvent(channels.dog, { name: "dog-walks-past", duration: 16, probability: 0.18, cooldown: 35 }),
    channelEvent(channels.cyclist, { name: "cyclist-rides-by", duration: 7, probability: 0.18, cooldown: 30 }),
    channelEvent(channels.couple, { name: "couple-sits-nearby", duration: 42, probability: 0.05, cooldown: 150 }),
    channelEvent(channels.football, { name: "child-chases-football", duration: 12, probability: 0.12, cooldown: 45 }),
    channelEvent(channels.squirrel, { name: "squirrel-crosses-lawn", duration: 11, probability: 0.2, cooldown: 25 }),
    channelEvent(channels.pigeons, { name: "pigeons-land-nearby", duration: 20, probability: 0.16, cooldown: 40 }),
    // ── Less common ─────────────────────────────────────────────────────
    channelEvent(channels.iceCreamVan, { name: "ice-cream-van-passes", duration: 30, probability: 0.04, cooldown: 200 }),
    channelEvent(channels.groundskeeper, { name: "groundskeeper-mows", duration: 36, probability: 0.035, cooldown: 240 }),
    channelEvent(channels.musician, { name: "street-musician-plays", duration: 45, probability: 0.04, cooldown: 200 }),
    channelEvent(channels.photographer, { name: "person-takes-photo", duration: 14, probability: 0.05, cooldown: 120 }),
    // ── Rare ────────────────────────────────────────────────────────────
    channelEvent(channels.wedding, { name: "wedding-photoshoot", duration: 40, probability: 0.01, cooldown: 420 }),
    channelEvent(channels.marathon, { name: "marathon-passes-through", duration: 16, probability: 0.01, cooldown: 360 }),
    channelEvent(channels.flashMob, { name: "flash-mob", duration: 26, probability: 0.008, cooldown: 420 }),
    channelEvent(channels.movieCrew, { name: "film-crew-shoots-scene", duration: 50, probability: 0.007, cooldown: 480 }),
    channelEvent(channels.bananaRunner, { name: "banana-runs-past", duration: 5, probability: 0.012, cooldown: 300 }),
  ];

  return { channels, events };
}
