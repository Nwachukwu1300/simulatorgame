/**
 * Distant ridgeline glimpsed through the canopy gap and the haze.
 * Deliberately simple silhouettes — the fog does the painting.
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
        <mesh key={i} position={[x, h / 2 - 2, z]}>
          <coneGeometry args={[r, h, 7]} />
          <meshStandardMaterial color="#4a5444" roughness={1} />
        </mesh>
      ))}
    </>
  );
}
