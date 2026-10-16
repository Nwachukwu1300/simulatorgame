import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ACHIEVEMENTS, newlyEarned, type ProgressStats } from "./achievements.ts";

const empty = (): ProgressStats => ({
  secondsBySim: { coconut: 0, bench: 0, idol: 0 },
  eventsWitnessed: 0,
  seenEvents: [],
});
const ids = (s: ProgressStats, unlocked: string[] = []) => newlyEarned(s, unlocked).map((a) => a.id);

test("nothing is earned at the start", () => {
  assert.deepEqual(ids(empty()), []);
});

test("time thresholds unlock at exactly the boundary", () => {
  const s = empty();
  s.secondsBySim.coconut = 59;
  assert.deepEqual(ids(s), []);
  s.secondsBySim.coconut = 600;
  assert.deepEqual(ids(s), ["still-here", "professional-coconut"]);
});

test("the collection needs a minute on every object", () => {
  const s = empty();
  s.secondsBySim = { coconut: 60, bench: 60, idol: 59 };
  assert.ok(!ids(s).includes("the-collection"));
  s.secondsBySim.idol = 60;
  assert.ok(ids(s).includes("the-collection"));
});

test("event achievements unlock on that event only", () => {
  const s = empty();
  s.seenEvents = ["crab-walks-past"];
  assert.deepEqual(ids(s), []);
  s.seenEvents.push("ufo-crosses-sky");
  assert.deepEqual(ids(s), ["first-contact"]);
});

test("already unlocked achievements are not returned again", () => {
  const s = empty();
  s.eventsWitnessed = 25;
  assert.deepEqual(ids(s, ["witness"]), []);
});

test("every event achievement names an event that exists in a scene", () => {
  const sources = ["coconut/events/coconutEvents.ts", "bench/events/benchEvents.ts", "jungle/events/jungleEvents.ts"]
    .map((f) => readFileSync(new URL(`../scenes/${f}`, import.meta.url), "utf8"))
    .join("\n");
  for (const a of ACHIEVEMENTS.filter((a) => a.event)) {
    assert.ok(sources.includes(`name: "${a.event}"`), `${a.id} -> missing event "${a.event}"`);
  }
});

test("achievement ids are unique and copy has no exclamation marks", () => {
  assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length);
  for (const a of ACHIEVEMENTS) assert.ok(!/!/.test(a.title + a.desc), a.id);
});
