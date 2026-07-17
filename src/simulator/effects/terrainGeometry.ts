import { Color, Float32BufferAttribute, PlaneGeometry } from "three";

export interface TerrainOptions {
  width: number;
  depth: number;
  widthSegments: number;
  depthSegments: number;
  /** Shift every vertex's z before sampling height/colour (Beach uses -10). */
  zOffset?: number;
  /** Terrain height at a world position. */
  height: (x: number, z: number) => number;
  /** Write the vertex colour for a world position into `out`. */
  colorAt: (x: number, z: number, y: number, out: Color) => void;
}

/**
 * Shared displaced-and-vertex-coloured ground builder used by every
 * simulator's terrain (beach sand, park lawn, jungle floor). Extracted in
 * Stage 6 — the three scenes only differ in their height and colour
 * functions.
 */
export function makeTerrainGeometry({
  width,
  depth,
  widthSegments,
  depthSegments,
  zOffset = 0,
  height,
  colorAt,
}: TerrainOptions): PlaneGeometry {
  const geo = new PlaneGeometry(width, depth, widthSegments, depthSegments);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const scratch = new Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i) + zOffset;
    const y = height(x, z);
    pos.setY(i, y);
    if (zOffset !== 0) pos.setZ(i, z);
    colorAt(x, z, y, scratch);
    colors[i * 3] = scratch.r;
    colors[i * 3 + 1] = scratch.g;
    colors[i * 3 + 2] = scratch.b;
  }
  geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}
