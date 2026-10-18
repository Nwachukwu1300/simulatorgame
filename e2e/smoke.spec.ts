import { test, expect, type Page } from "@playwright/test";

// Smoke tests for the whole player journey. Screens fade, so assertions wait for
// visibility rather than sleeping.

const SIMS = ["Coconut Simulator", "Bench Simulator", "Jungle Idol Simulator"] as const;

/** Fails the test on any uncaught page error or failed same-origin request. */
function watchForErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400 && r.url().startsWith("http://localhost")) errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
}

async function openSelect(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Choose Your Simulator" })).toBeVisible();
}

async function startSim(page: Page, name: string) {
  await openSelect(page);
  await page.getByRole("button", { name: new RegExp(`^${name}`) }).click();
  await expect(page.getByText("Continue Existing")).toBeVisible({ timeout: 60_000 });
}

test("main menu loads with title and menu art", async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto("/");
  await expect(page).toHaveTitle("Simulator Collection");
  await expect(page.getByRole("heading", { name: /Simulator\s*Collection/ })).toBeVisible();
  await expect(page.locator('img[src^="/menu/"]').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("Arcade mode explains itself and reverts to Realistic; Escape closes it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await expect(page.getByText("You Remain an Inanimate Object")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByText("You Remain an Inanimate Object")).toBeHidden();
  // Still on Settings; Escape again goes back to the main menu
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
});

for (const sim of SIMS) {
  test(`${sim}: loads, renders, pauses, resumes and quits`, async ({ page }) => {
    const errors = watchForErrors(page);
    await startSim(page, sim);
    await expect(page.locator("canvas")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByText("Take Your Time")).toBeVisible();
    await expect(page.getByText("Record of Existence")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText("Take Your Time")).toBeHidden();
    await expect(page.getByText("Continue Existing")).toBeVisible();

    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Quit to Menu" }).click();
    await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test("rapid double Escape returns to the game", async ({ page }) => {
  await startSim(page, "Bench Simulator");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150); // mid-fade
  await page.keyboard.press("Escape");
  await expect(page.getByText("Take Your Time")).toBeHidden();
  await expect(page.getByText("Continue Existing")).toBeVisible();
});

test("cancelling a load returns to the select screen and stays there", async ({ page }) => {
  await openSelect(page);
  await page.getByRole("button", { name: /^Coconut Simulator/ }).click();
  await expect(page.getByText("Loading Environment")).toBeVisible();
  await page.getByRole("button", { name: "← Back" }).click();
  await expect(page.getByRole("heading", { name: "Choose Your Simulator" })).toBeVisible();
  await page.waitForTimeout(4000); // longer than a load takes
  await expect(page.getByText("Continue Existing")).toBeHidden();
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("simulator cards are keyboard selectable", async ({ page }) => {
  await openSelect(page);
  await page.getByRole("button", { name: /^Bench Simulator/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Continue Existing")).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText("Bench Simulator").first()).toBeVisible();
});

test("achievements unlock, show a toast and persist", async ({ page }) => {
  // Seed 58 seconds of existence so "Still Here" (one minute) unlocks almost immediately.
  await page.addInitScript(() => {
    if (localStorage.getItem("simulator-collection-progress")) return;
    localStorage.setItem(
      "simulator-collection-progress",
      JSON.stringify({
        state: { secondsBySim: { coconut: 0, bench: 58, idol: 0 }, eventsWitnessed: 0, seenEvents: [], unlocked: [] },
        version: 0,
      }),
    );
  });
  await startSim(page, "Bench Simulator");
  await expect(page.getByText("Achievement Unlocked")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Still Here", { exact: true })).toBeVisible();

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("simulator-collection-progress")!).state);
  expect(saved.unlocked).toContain("still-here");
  expect(saved.secondsBySim.bench).toBeGreaterThanOrEqual(60);
});

test("Quit closes the tab, or shows the farewell screen when the browser refuses", async ({ page }) => {
  await page.goto("/");
  const farewell = page.getByRole("heading", { name: "Thank You for Existing" });
  // Browsers only let script close tabs that script opened. Test tabs are script-opened,
  // so some browsers (Firefox) really close; real visitors' tabs get the farewell screen.
  const outcome = await Promise.race([
    page.waitForEvent("close").then(() => "closed"),
    page
      .getByRole("button", { name: "Quit", exact: true })
      .click()
      .then(() => expect(farewell).toBeVisible())
      .then(() => "farewell"),
  ]).catch(() => (page.isClosed() ? "closed" : "error"));
  expect(["closed", "farewell"]).toContain(outcome);
  if (outcome === "closed") return;
  await page.getByRole("button", { name: "← Back" }).click();
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
});

test("select screen is usable on a phone-sized screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSelect(page);
  const cards = page.getByRole("button", { name: /Simulator\./ });
  await expect(cards).toHaveCount(3);
  // Stacked vertically, each fully on screen (polled: the screen fades in with a slight zoom)
  await expect
    .poll(() => cards.evaluateAll((els) => els.every((e) => {
      const b = e.getBoundingClientRect();
      return b.width > 350 && b.bottom <= 844 + 1;
    })))
    .toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("the Graphics choice is remembered after a reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Low", exact: true }).click();
  await page.reload();
  const stored = await page.evaluate(() => localStorage.getItem("simulator-collection-graphics"));
  expect(stored).toBe("Low");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  // The active option is drawn in the accent colour
  await expect(page.getByRole("button", { name: "Low", exact: true })).toHaveCSS("color", "rgb(196, 122, 53)");
});

test("reduced motion stops the drifting menu art", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".menu-drift").first()).toHaveCSS("animation-name", "none");
});

test("the page is indexable and has link-preview tags", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/menu\/coconut\.jpg$/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Simulator Collection");
});
