import type { Group } from "three";

/**
 * Shared NPC primitives (promoted from the Coconut scene in Stage 5).
 * Deliberately abstract silhouettes — the world is serious, the people
 * are set dressing.
 */

/** Minimal humanoid silhouette shared by every NPC. */
export function Figure({
  shirt = "#7a6a5a",
  pants = "#4a4440",
  skin = "#c9a582",
}: {
  shirt?: string;
  pants?: string;
  skin?: string;
}) {
  return (
    <group>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.07, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.05, 0.75, 6]} />
          <meshStandardMaterial color={pants} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.16, 0.62, 8]} />
        <meshStandardMaterial color={shirt} roughness={1} />
      </mesh>
      <mesh position={[0, 1.52, 0]} castShadow>
        <sphereGeometry args={[0.11, 12, 10]} />
        <meshStandardMaterial color={skin} roughness={1} />
      </mesh>
    </group>
  );
}

/** Sitting variant: bent legs, lowered torso. Origin at the seat surface. */
export function SeatedFigure({
  shirt = "#7a6a5a",
  pants = "#4a4440",
  skin = "#c9a582",
}: {
  shirt?: string;
  pants?: string;
  skin?: string;
}) {
  return (
    <group>
      {/* Thighs forward */}
      {[-1, 1].map((s) => (
        <mesh key={`t${s}`} position={[s * 0.08, 0.03, 0.16]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.34, 6]} />
          <meshStandardMaterial color={pants} roughness={1} />
        </mesh>
      ))}
      {/* Shins down */}
      {[-1, 1].map((s) => (
        <mesh key={`s${s}`} position={[s * 0.08, -0.2, 0.31]} castShadow>
          <cylinderGeometry args={[0.045, 0.05, 0.42, 6]} />
          <meshStandardMaterial color={pants} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.16, 0.62, 8]} />
        <meshStandardMaterial color={shirt} roughness={1} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.11, 12, 10]} />
        <meshStandardMaterial color={skin} roughness={1} />
      </mesh>
    </group>
  );
}

/**
 * Walking gait applied to a whole figure: bob + slight roll.
 * `groundY` is the terrain height at (x, z), computed by the caller so
 * this stays terrain-agnostic. `rate` scales the stride (jog > walk).
 */
export function walk(
  g: Group,
  x: number,
  groundY: number,
  z: number,
  t: number,
  facing: number,
  rate = 5.2,
) {
  g.position.set(x, groundY + Math.abs(Math.sin(t * rate)) * 0.04, z);
  g.rotation.set(0, facing, Math.sin(t * rate) * 0.04);
}
