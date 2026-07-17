/**
 * The Forgotten Temple's clearing. Packed earth around the idol, a
 * winding dirt path in front of it, and an uneven root-broken forest
 * floor everywhere else.
 */

/** The dirt path winds east-west in front of the idol. */
export const PATH_Z = 2.1;

/** Centre line of the path at a given x (it meanders). */
export function pathCenter(x: number): number {
  return PATH_Z + Math.sin(x * 0.22) * 0.9;
}

export function onDirtPath(x: number, z: number): boolean {
  if (Math.abs(z - pathCenter(x)) < 0.85) return true;
  // The idol's clearing is worn down to earth too
  return Math.hypot(x, z) < 2.9;
}

export function jungleHeight(x: number, z: number): number {
  // Flat in the clearing and along the path, lumpy beneath the trees
  const fromPath = Math.abs(z - pathCenter(x)) - 1.6;
  const fromIdol = Math.hypot(x, z) - 3.6;
  const d = Math.max(0, Math.min(fromPath, fromIdol));
  const fade = Math.min(1, d / 8);
  const lumps =
    Math.sin(x * 0.31) * Math.cos(z * 0.27) * 0.35 +
    Math.sin(x * 0.83 + 1.7) * Math.sin(z * 0.71 - 0.4) * 0.18 +
    Math.sin(x * 0.06 - 1.1) * Math.cos(z * 0.05 + 0.8) * 0.6;
  return lumps * fade;
}
