import { useMemo } from "react";
import { Color, Float32BufferAttribute, PlaneGeometry } from "three";
import { isOnPath, parkHeight } from "./terrain";

const GRASS = new Color("#57683a");
const GRASS_DRY = new Color("#7a7440");
const LEAF_LITTER = new Color("#8a6a38");
const PATH = new Color("#98938a");
const PATH_DARK = new Color("#807b72");

/**
 * The park lawn: one vertex-coloured plane. Grass gets autumn-dry patches
 * and leaf litter; the footpath corridor is baked in as worn asphalt with
 * per-vertex grain (same technique as the coconut Beach).
 */
export function Ground() {
  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(150, 150, 110, 110);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const scratch = new Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, parkHeight(x, z));

      if (isOnPath(x, z)) {
        scratch.copy(PATH).lerp(PATH_DARK, Math.random() * 0.6);
      } else {
        // Autumn lawn: green base, dry patches, drifts of fallen leaves
        const dry = Math.max(0, Math.sin(x * 0.21 + 1.3) * Math.cos(z * 0.17));
        const litter = Math.max(0, Math.sin(x * 0.4 - 0.5) * Math.sin(z * 0.33 + 2)) * 0.5;
        scratch
          .copy(GRASS)
          .lerp(GRASS_DRY, dry * 0.55)
          .lerp(LEAF_LITTER, litter);
        const grain = 0.94 + Math.random() * 0.12;
        scratch.multiplyScalar(grain);
      }
      colors[i * 3] = scratch.r;
      colors[i * 3 + 1] = scratch.g;
      colors[i * 3 + 2] = scratch.b;
    }
    geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} />
    </mesh>
  );
}
