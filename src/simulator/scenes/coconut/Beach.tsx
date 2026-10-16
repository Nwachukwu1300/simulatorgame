import { useMemo } from "react";
import { Color } from "three";
import { makeTerrainGeometry } from "../../effects/terrainGeometry";
import { sandHeight } from "./terrain";

const DRY = new Color("#d9c69c");
const WET = new Color("#a8916a");
const UNDERWATER = new Color("#8d7a58");

/**
 * Sandy beach terrain: displaced grid with per-vertex colour so the sand
 * darkens (wet) near the waterline and continues under the ocean.
 */
export function Beach() {
  const geometry = useMemo(
    () =>
      makeTerrainGeometry({
        width: 160,
        depth: 70,
        widthSegments: 128,
        depthSegments: 72,
        zOffset: -10, // shift so more sand lies behind the coconut
        height: sandHeight,
        colorAt: (x, z, y, c) => {
          // Wet band around the shoreline, dry further up the beach
          const wetness = 1 - Math.min(1, Math.max(0, (z + 1.2) / 2.8));
          c.copy(DRY).lerp(WET, wetness);
          if (y < 0) c.lerp(UNDERWATER, Math.min(1, -y * 2));
          // subtle grain variation
          const grain = 1 + (Math.sin(x * 12.9 + z * 7.7) * 0.5 + Math.sin(x * 3.1) * 0.5) * 0.03;
          c.multiplyScalar(grain);
        },
      }),
    [],
  );

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} metalness={0} />
    </mesh>
  );
}
