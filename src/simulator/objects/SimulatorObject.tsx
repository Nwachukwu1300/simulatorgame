import { forwardRef, type ReactNode } from "react";
import type { Group } from "three";

export interface SimulatorObjectProps {
  /** Fixed world position. The player can never move the object. */
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  /** The object's mesh(es) — a placeholder primitive now, a GLTF later. */
  children: ReactNode;
}

/**
 * SimulatorObject — the star of every simulator (coconut, bench, idol).
 *
 * A deliberately passive wrapper: it fixes the object's transform and
 * exposes a group ref so future systems can play subtle animations
 * (settling, weathering, being rained on). It accepts no input; there is
 * no way for the player to move it. This is the entire point of the game.
 */
export const SimulatorObject = forwardRef<Group, SimulatorObjectProps>(
  function SimulatorObject({ position = [0, 0, 0], rotation, scale, children }, ref) {
    return (
      <group ref={ref} position={position} rotation={rotation} scale={scale}>
        {children}
      </group>
    );
  },
);
