/**
 * Distant ridgeline glimpsed through the canopy gap and the haze.
 * Rounded, forest-covered hills (sharp cones read as pyramids); the fog does the painting.
 */
export function Mountains() {
  const peaks: [number, number, number, number][] = [
    // [x, z, radius, height]
    [-45, -95, 30, 26],
    [-5, -105, 38, 34],
    [35, -92, 26, 22],
    [70, -110, 34, 30],
    [-80, -108, 36, 28],
  ];
  return (
    <>
      {peaks.map(([x, z, r, h], i) => (
        // Half-buried flattened sphere: a broad hill rather than a peak.
        <mesh key={i} position={[x, -2, z]} scale={[r, h, r * 0.7]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#2f4228" roughness={1} flatShading />
        </mesh>
      ))}
    </>
  );
}
