import { useMemo } from "react";
import { Color } from "three";
import { makeTerrainGeometry } from "../../effects/terrainGeometry";
import { isOnPath, parkHeight } from "./terrain";

const GRASS = new Color("#57683a");
const GRASS_DRY = new Color("#7a7440");
const LEAF_LITTER = new Color("#8a6a38");
const PATH = new Color("#98938a");
const PATH_DARK = new Color("#807b72");

/**
 * The park lawn: one vertex-coloured plane. Grass gets autumn-dry patches
 * and leaf litter; the footpath corridor is baked in as worn asphalt with
 * per-vertex grain.
 */
export function Ground() {
  const geometry = useMemo(
    () =>
      makeTerrainGeometry({
        width: 150,
        depth: 150,
        widthSegments: 110,
        depthSegments: 110,
        height: parkHeight,
        colorAt: (x, z, _y, c) => {
          if (isOnPath(x, z)) {
            c.copy(PATH).lerp(PATH_DARK, Math.random() * 0.6);
            return;
          }
          // Autumn lawn: green base, dry patches, drifts of fallen leaves
          const dry = Math.max(0, Math.sin(x * 0.21 + 1.3) * Math.cos(z * 0.17));
          const litter = Math.max(0, Math.sin(x * 0.4 - 0.5) * Math.sin(z * 0.33 + 2)) * 0.5;
          c.copy(GRASS)
            .lerp(GRASS_DRY, dry * 0.55)
            .lerp(LEAF_LITTER, litter)
            .multiplyScalar(0.94 + Math.random() * 0.12);
        },
      }),
    [],
  );

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} />
    </mesh>
  );
}
