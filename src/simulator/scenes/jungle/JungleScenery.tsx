import { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { DoubleSide, MeshStandardMaterial } from "three";
import { jungleHeight } from "./terrain";
import { MODELS } from "../../utils/assetLoader";

// Additional tropical trees scattered around the clearing edges
const TROPICAL_TREES: [number, number, number][] = [
  // [x, z, scale]
  [-12, 8, 0.9],
  [10, 9.5, 1.1],
  [-15, -8, 1.0],
  [13, -6, 0.85],
  [-18, 0, 1.2],
  [18, 1.5, 0.95],
];

// Fallen logs and mossy tree stumps
const FALLEN_LOGS: [number, number, number, number][] = [
  // [x, z, rotation, scale]
  [-8, -2.5, 0.4, 1.0],
  [6.5, 4.2, -0.8, 0.8],
  [-5, 7.8, 1.2, 0.9],
];

// Large fern clusters for depth
const LARGE_FERNS: [number, number, number][] = [
  [-4.5, 2.8, 1.2],
  [5.2, 3.5, 1.0],
  [-7.2, -1.5, 1.1],
  [8.5, -2.8, 0.9],
  [-2.8, 6.2, 1.0],
  [3.8, 6.8, 1.1],
];

/**
 * 3D tropical tree loaded from GLB model.
 */
function TropicalTree3D({ x, z, scale }: { x: number; z: number; scale: number }) {
  const { scene } = useGLTF(MODELS.tropicalTree);
  const y = jungleHeight(x, z);

  return (
    <group position={[x, y, z]} rotation={[0, Math.random() * Math.PI * 2, 0]}>
      <primitive
        object={scene.clone()}
        scale={scale}
        castShadow
        receiveShadow
      />
    </group>
  );
}

/**
 * Procedural tropical tree fallback.
 */
function TropicalTreeProcedural({ x, z, scale }: { x: number; z: number; scale: number }) {
  const y = jungleHeight(x, z);
  const height = 6 * scale;

  return (
    <group position={[x, y, z]} rotation={[0, x * z, 0]}>
      {/* Curved trunk */}
      <mesh position={[0, height * 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.08 * scale, 0.15 * scale, height, 6]} />
        <meshStandardMaterial color="#5a4a3a" roughness={1} />
      </mesh>
      {/* Large leaves */}
      {[0, 1.2, 2.4, 3.6, 4.8].map((a, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(a) * 0.8 * scale,
            height - 0.3 + Math.sin(i) * 0.2,
            Math.sin(a) * 0.8 * scale,
          ]}
          rotation={[0.6, a, 0]}
          castShadow
        >
          <planeGeometry args={[1.5 * scale, 0.4 * scale]} />
          <meshStandardMaterial color="#2d4824" roughness={1} side={DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Tropical tree with 3D model and procedural fallback.
 * NOTE: Using procedural only - 3D model is too large (52MB)
 */
function TropicalTree(props: { x: number; z: number; scale: number }) {
  // Skip 3D model loading - file is too large for web
  return <TropicalTreeProcedural {...props} />;
}

/**
 * Procedural fallen log.
 */
function FallenLog({ x, z, rotation, scale }: { x: number; z: number; rotation: number; scale: number }) {
  const y = jungleHeight(x, z);

  return (
    <group position={[x, y + 0.15 * scale, z]} rotation={[0.1, rotation, Math.PI / 2 - 0.1]}>
      {/* Main log */}
      <mesh castShadow>
        <cylinderGeometry args={[0.18 * scale, 0.22 * scale, 2.5 * scale, 8]} />
        <meshStandardMaterial color="#4a3a2a" roughness={1} />
      </mesh>
      {/* Moss patches */}
      <mesh position={[0, 0.15 * scale, 0.3 * scale]}>
        <sphereGeometry args={[0.25 * scale, 6, 5]} />
        <meshStandardMaterial color="#3a5230" roughness={1} />
      </mesh>
      <mesh position={[0.5 * scale, 0.12 * scale, -0.2 * scale]}>
        <sphereGeometry args={[0.18 * scale, 6, 5]} />
        <meshStandardMaterial color="#445c38" roughness={1} />
      </mesh>
      {/* Broken branch stub */}
      <mesh position={[-0.6 * scale, 0.1 * scale, 0]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.05 * scale, 0.08 * scale, 0.4 * scale, 5]} />
        <meshStandardMaterial color="#3e3020" roughness={1} />
      </mesh>
    </group>
  );
}

/**
 * 3D fern cluster loaded from GLB model.
 */
function Fern3D({ x, z, scale }: { x: number; z: number; scale: number }) {
  const { scene } = useGLTF(MODELS.fern);
  const y = jungleHeight(x, z);

  return (
    <group position={[x, y, z]} rotation={[0, Math.random() * Math.PI * 2, 0]}>
      <primitive
        object={scene.clone()}
        scale={scale}
        castShadow
      />
    </group>
  );
}

/**
 * Procedural fern cluster fallback.
 */
function FernProcedural({ x, z, scale }: { x: number; z: number; scale: number }) {
  const y = jungleHeight(x, z);
  const mat = useMemo(() => new MeshStandardMaterial({
    color: "#3a5a2e",
    roughness: 1,
    side: DoubleSide
  }), []);

  return (
    <group position={[x, y, z]}>
      {[0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6].map((a, i) => (
        <mesh
          key={i}
          position={[Math.cos(a) * 0.15 * scale, 0.4 * scale, Math.sin(a) * 0.15 * scale]}
          rotation={[0.7, a, 0]}
          scale={[0.9 + (i % 3) * 0.1, 1, 1]}
        >
          <planeGeometry args={[0.12 * scale, 0.7 * scale]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Fern cluster with 3D model and procedural fallback.
 * NOTE: Using procedural only - 3D model is too large (14.8MB)
 */
function Fern(props: { x: number; z: number; scale: number }) {
  // Skip 3D model loading - file is too large for web
  return <FernProcedural {...props} />;
}

/**
 * Hanging vines from trees - adds atmosphere.
 */
function HangingVine({ x, z, length }: { x: number; z: number; length: number }) {
  const y = jungleHeight(x, z) + 7; // Start from tree canopy height

  return (
    <group position={[x, y, z]}>
      {/* Main vine strand */}
      <mesh position={[0, -length / 2, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.01, length, 4]} />
        <meshStandardMaterial color="#3a4a30" roughness={1} />
      </mesh>
      {/* Small leaves along the vine */}
      {Array.from({ length: Math.floor(length / 0.5) }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 2.3) * 0.08,
            -i * 0.5 - 0.2,
            Math.cos(i * 1.7) * 0.08,
          ]}
          rotation={[0, i * 1.2, Math.PI / 4]}
        >
          <planeGeometry args={[0.08, 0.12]} />
          <meshStandardMaterial color="#3d5a2e" roughness={1} side={DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// Vine positions (near trees)
const EXTRA_VINES: [number, number, number][] = [
  [-6.5, -3.5, 3.2],
  [6.2, -6.8, 2.8],
  [-9.5, 2.2, 4.0],
  [7.8, 5.5, 3.5],
  [-3.2, -10, 2.6],
  [11.5, -2.8, 3.8],
];

/**
 * Additional jungle scenery: tropical trees, fallen logs, fern clusters,
 * and hanging vines. These add depth and realism to the environment.
 * Uses 3D models when available with procedural fallbacks.
 */
export function JungleScenery() {
  return (
    <>
      {/* Additional tropical trees at the clearing edges */}
      {TROPICAL_TREES.map(([x, z, scale], i) => (
        <TropicalTree key={`tree${i}`} x={x} z={z} scale={scale} />
      ))}

      {/* Fallen logs with moss */}
      {FALLEN_LOGS.map(([x, z, rot, scale], i) => (
        <FallenLog key={`log${i}`} x={x} z={z} rotation={rot} scale={scale} />
      ))}

      {/* Large fern clusters */}
      {LARGE_FERNS.map(([x, z, scale], i) => (
        <Fern key={`fern${i}`} x={x} z={z} scale={scale} />
      ))}

      {/* Extra hanging vines */}
      {EXTRA_VINES.map(([x, z, length], i) => (
        <HangingVine key={`vine${i}`} x={x} z={z} length={length} />
      ))}
    </>
  );
}
