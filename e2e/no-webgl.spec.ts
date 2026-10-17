import { test, expect } from "@playwright/test";

// Runs only in the "no-webgl" project (Chrome launched with 3D APIs disabled).
test("without WebGL the game explains itself and the menus keep working", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: /^Bench Simulator/ }).click();

  const notice = page.getByRole("alert");
  await expect(notice.getByRole("heading", { name: "This World Cannot Be Rendered" })).toBeVisible();

  await notice.getByRole("button", { name: "← Back" }).click();
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
});
