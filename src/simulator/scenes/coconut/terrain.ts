/**
 * Shared beach terrain math. The mesh, the coconut placement, and every
 * ground-based event actor sample the same height function so feet/shells
 * always sit on the sand.
 *
 * Layout: ocean fills z < ~-2 (water level y=0), dry sand rises toward +z
 * (behind the coconut, toward the camera). Coconut sits at the origin.
 */
export function sandHeight(x: number, z: number): number {
  const slope = (z + 2) * 0.05; // rises away from the waterline
  const dunes = Math.sin(x * 0.22) * Math.cos(z * 0.19) * 0.12;
  const ripples = Math.sin(x * 1.4 + z * 0.8) * 0.02 + Math.cos(x * 0.7 - z * 1.1) * 0.015;
  return Math.max(-0.9, slope + dunes + ripples);
}

/** Waterline z where sand dips underwater (approximate, for placement). */
export const SHORELINE_Z = -2;
