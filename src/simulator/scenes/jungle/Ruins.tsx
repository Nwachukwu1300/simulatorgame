import { Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { jungleHeight } from "./terrain";
import { MODELS } from "../../utils/assetLoader";

/** Where the ancient torch stands (the torch event lights it). */
export const TORCH_POS: [number, number, number] = [-3.4, 0, -2.2];

/** Where the archaeologist event kneels to work. */
export const DIG_SPOT: [number, number, number] = [-4.6, 0, -0.6];

const STONE = "#6e6c60";
const STONE_MOSSY = "#5a6350";

/**
 * 3D column loaded from GLB model.
 */
function Column3D({
  x,
  z,
  height,
  lean = 0,
}: {
  x: number;
  z: number;
  height: number;
  lean?: number;
}) {
  const { scene } = useGLTF(MODELS.templeColumn);
  const y = jungleHeight(x, z);
  const scale = height / 1.5; // Normalize to base height

  return (
    <group position={[x, y, z]} rotation={[0, Math.random() * Math.PI, lean]}>
      <primitive
        object={scene.clone()}
        scale={[scale, scale, scale]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

/**
 * Procedural broken column fallback.
 */
function BrokenColumnProcedural({
  x,
  z,
  height,
  lean = 0,
}: {
  x: number;
  z: number;
  height: number;
  lean?: number;
}) {
  const y = jungleHeight(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, 0, lean]}>
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.2, 9]} />
        <meshStandardMaterial color={STONE_MOSSY} roughness={1} />
      </mesh>
      <mesh position={[0, height / 2 + 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.3, height, 9]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      {/* Jagged broken top */}
      <mesh position={[0.05, height + 0.32, 0]} rotation={[0.2, 0.5, 0.15]} castShadow>
        <cylinderGeometry args={[0.22, 0.27, 0.28, 9]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      {/* Moss on the shaded side */}
      <mesh position={[-0.22, height * 0.4, 0.1]} scale={[0.4, height * 0.42, 0.4]}>
        <sphereGeometry args={[0.5, 7, 6]} />
        <meshStandardMaterial color="#3c5230" roughness={1} />
      </mesh>
    </group>
  );
}

/**
 * Broken column with 3D model and procedural fallback.
 * NOTE: Using procedural only - no 3D model file available
 */
function BrokenColumn(props: { x: number; z: number; height: number; lean?: number }) {
  return <BrokenColumnProcedural {...props} />;
}

/**
 * 3D boulder loaded from GLB model.
 */
function Boulder3D({ x, z, s }: { x: number; z: number; s: number }) {
  const { scene } = useGLTF(MODELS.mossyBoulder);
  const y = jungleHeight(x, z);

  return (
    <group position={[x, y, z]} rotation={[0, Math.random() * Math.PI * 2, 0]}>
      <primitive
        object={scene.clone()}
        scale={s}
        castShadow
        receiveShadow
      />
    </group>
  );
}

/**
 * Procedural boulder fallback.
 */
function BoulderProcedural({ x, z, s, i }: { x: number; z: number; s: number; i: number }) {
  return (
    <mesh position={[x, jungleHeight(x, z) + s * 0.45, z]} rotation={[0.3, i * 1.8, 0.2]} castShadow>
      <dodecahedronGeometry args={[s]} />
      <meshStandardMaterial color="#63615a" roughness={1} />
    </mesh>
  );
}

/**
 * Boulder with 3D model and procedural fallback.
 * NOTE: Using procedural only - no 3D model file available
 */
function Boulder({ x, z, s, i }: { x: number; z: number; s: number; i: number }) {
  return <BoulderProcedural x={x} z={z} s={s} i={i} />;
}

/**
 * 3D ancient torch loaded from GLB model.
 */
function AncientTorch3D() {
  const { scene } = useGLTF(MODELS.ancientTorch);
  const y = jungleHeight(TORCH_POS[0], TORCH_POS[2]);

  return (
    <group position={[TORCH_POS[0], y, TORCH_POS[2]]}>
      <primitive
        object={scene.clone()}
        scale={1}
        castShadow
      />
    </group>
  );
}

/**
 * Procedural torch fallback.
 */
function AncientTorchProcedural() {
  return (
    <group position={[TORCH_POS[0], jungleHeight(TORCH_POS[0], TORCH_POS[2]), TORCH_POS[2]]}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 1.3, 6]} />
        <meshStandardMaterial color="#3e3222" roughness={1} />
      </mesh>
      <mesh position={[0, 1.34, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.05, 0.16, 7]} />
        <meshStandardMaterial color="#2e2820" roughness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Ancient torch with 3D model and procedural fallback.
 * NOTE: Using procedural only for consistency
 */
function AncientTorch() {
  return <AncientTorchProcedural />;
}

/**
 * 3D temple facade loaded from GLB model.
 */
function TempleFacade3D() {
  const { scene } = useGLTF(MODELS.templeFacade);
  const y = jungleHeight(0, -14);

  return (
    <group position={[0, y, -14]}>
      <primitive
        object={scene.clone()}
        scale={1}
        castShadow
        receiveShadow
      />
    </group>
  );
}

/**
 * Procedural temple facade fallback.
 */
function TempleFacadeProcedural() {
  return (
    <group position={[0, jungleHeight(0, -14), -14]}>
      {/* Stepped platform */}
      {[
        [9, 0.8, 4.5, 0.4],
        [7, 0.8, 3.5, 1.2],
        [5, 0.8, 2.5, 2],
      ].map(([w, h, d, y], i) => (
        <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={i % 2 ? STONE_MOSSY : "#66645a"} roughness={1} />
        </mesh>
      ))}
      {/* Doorway into darkness */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.8, 3.1, 0.4]} castShadow>
          <boxGeometry args={[0.5, 1.4, 0.5]} />
          <meshStandardMaterial color={STONE} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 3.95, 0.4]} castShadow>
        <boxGeometry args={[2.4, 0.35, 0.55]} />
        <meshStandardMaterial color={STONE_MOSSY} roughness={1} />
      </mesh>
      <mesh position={[0, 3.05, 0.42]}>
        <planeGeometry args={[1.1, 1.3]} />
        <meshStandardMaterial color="#0c0e0a" roughness={1} />
      </mesh>
    </group>
  );
}

/**
 * Temple facade with 3D model and procedural fallback.
 * NOTE: Using procedural only - 3D model is too large (18.6MB)
 */
function TempleFacade() {
  return <TempleFacadeProcedural />;
}

/**
 * What is left of the temple complex: broken colonnade by the idol, a
 * fallen column across the undergrowth, scattered blocks, boulders, the
 * unlit ancient torch, and the temple facade half-swallowed behind it all.
 *
 * Uses 3D models when available with procedural fallbacks.
 */
export function Ruins() {
  return (
    <>
      <BrokenColumn x={-3.8} z={-3.5} height={1.9} lean={0.04} />
      <BrokenColumn x={-5.2} z={-2} height={1.1} lean={-0.06} />
      <BrokenColumn x={4.4} z={-3.8} height={1.5} lean={0.05} />
      {/* Fallen column, mid-return to soil */}
      <mesh
        position={[2.8, jungleHeight(2.8, -5.2) + 0.22, -5.2]}
        rotation={[0.05, 0.7, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.26, 0.29, 2.6, 9]} />
        <meshStandardMaterial color={STONE_MOSSY} roughness={1} />
      </mesh>
      {/* Scattered carved blocks */}
      {(
        [
          [-2.2, -4.6, 0.5, 0.7],
          [1.6, -3.4, 0.4, -0.4],
          [-6.2, 0.8, 0.55, 1.2],
          [5.6, -1.6, 0.35, 0.3],
          [-1.4, -6.8, 0.6, -0.9],
        ] as const
      ).map(([x, z, s, rot], i) => (
        <mesh
          key={i}
          position={[x, jungleHeight(x, z) + s * 0.4, z]}
          rotation={[0, rot, (i % 2) * 0.12]}
          castShadow
        >
          <boxGeometry args={[s * 1.6, s, s * 1.1]} />
          <meshStandardMaterial color={i % 2 ? STONE_MOSSY : STONE} roughness={1} />
        </mesh>
      ))}
      {/* Boulders */}
      {(
        [
          [7.2, 1.8, 0.7],
          [-7.8, -4.2, 0.9],
          [0.8, -8.6, 0.8],
          [-9.2, 5.8, 0.6],
        ] as const
      ).map(([x, z, s], i) => (
        <Boulder key={`b${i}`} x={x} z={z} s={s} i={i} />
      ))}
      {/* The ancient torch. Unlit. Usually. */}
      <AncientTorch />
      {/* Temple facade, half-buried behind the idol */}
      <TempleFacade />
    </>
  );
}
