/**
 * Meridian Park terrain. The lawn is flat around the bench and the main
 * footpath, then rolls gently toward the park edges.
 */

/** Main footpath runs east-west in front of the bench. */
export const PATH_Z = 2.2;
export const PATH_HALF_WIDTH = 0.95;

/** Secondary path branches north from the main one. */
export const CROSS_PATH_X = -7;
export const CROSS_PATH_HALF_WIDTH = 0.7;

export function isOnPath(x: number, z: number): boolean {
  if (Math.abs(z - PATH_Z) < PATH_HALF_WIDTH) return true;
  return Math.abs(x - CROSS_PATH_X) < CROSS_PATH_HALF_WIDTH && z < PATH_Z;
}

export function parkHeight(x: number, z: number): number {
  // Distance from the flat zone (bench + path corridor)
  const fromPath = Math.abs(z - PATH_Z) - 3;
  const fromBench = Math.hypot(x, z) - 4;
  const d = Math.max(0, Math.min(fromPath, fromBench));
  const fade = Math.min(1, d / 14);
  const roll =
    Math.sin(x * 0.14) * Math.cos(z * 0.11) * 0.4 +
    Math.sin(x * 0.05 + 2.1) * Math.cos(z * 0.04 - 0.7) * 0.5;
  return roll * fade;
}
