import { useMemo } from "react";
import { BufferAttribute, Color, PlaneGeometry } from "three";
import { sandHeight } from "./terrain";

const DRY = new Color("#d9c69c");
const WET = new Color("#a8916a");
const UNDERWATER = new Color("#8d7a58");

/**
 * Sandy beach terrain: displaced grid with per-vertex colour so the sand
 * darkens (wet) near the waterline and continues under the ocean.
 */
export function Beach() {
  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(160, 70, 128, 72);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i) - 10; // shift so more sand lies behind the coconut
      const y = sandHeight(x, z);
      pos.setY(i, y);
      pos.setZ(i, z);
      // Wet band around the shoreline, dry further up the beach
      const wetness = 1 - Math.min(1, Math.max(0, (z + 1.2) / 2.8));
      c.copy(DRY).lerp(WET, wetness);
      if (y < 0) c.lerp(UNDERWATER, Math.min(1, -y * 2));
      // subtle grain variation
      const grain = 1 + (Math.sin(x * 12.9 + z * 7.7) * 0.5 + Math.sin(x * 3.1) * 0.5) * 0.03;
      colors[i * 3] = c.r * grain;
      colors[i * 3 + 1] = c.g * grain;
      colors[i * 3 + 2] = c.b * grain;
    }
    geo.setAttribute("color", new BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} metalness={0} />
    </mesh>
  );
}
