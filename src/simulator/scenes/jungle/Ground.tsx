import { useMemo } from "react";
import { Color } from "three";
import { makeTerrainGeometry } from "../../effects/terrainGeometry";
import { jungleHeight, onDirtPath } from "./terrain";

const EARTH = new Color("#43371f");
const LITTER = new Color("#5c4826");
const MOSS = new Color("#3c5230");
const MOSS_DEEP = new Color("#2e4226");
const DIRT = new Color("#6b5638");
const DIRT_DARK = new Color("#57452c");

/**
 * Jungle floor: dark earth under deep leaf litter, moss creeping in from
 * the shade, and the worn dirt path/clearing baked in per-vertex.
 */
export function Ground() {
  const geometry = useMemo(
    () =>
      makeTerrainGeometry({
        width: 130,
        depth: 130,
        widthSegments: 110,
        depthSegments: 110,
        height: jungleHeight,
        colorAt: (x, z, _y, c) => {
          if (onDirtPath(x, z)) {
            c.copy(DIRT).lerp(DIRT_DARK, Math.random() * 0.55);
            return;
          }
          const mossy = Math.max(0, Math.sin(x * 0.24 + 0.8) * Math.cos(z * 0.19 - 1.2));
          const litter = Math.max(0, Math.sin(x * 0.5 - 1.7) * Math.sin(z * 0.42 + 0.6));
          c.copy(EARTH)
            .lerp(LITTER, litter * 0.7)
            .lerp(MOSS, mossy * 0.7)
            .lerp(MOSS_DEEP, Math.max(0, mossy - 0.6))
            .multiplyScalar(0.92 + Math.random() * 0.16);
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
