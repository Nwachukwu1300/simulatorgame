import { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { MODELS } from "../../utils/assetLoader";
import { sandHeight } from "./terrain";

/**
 * Single palm tree instance.
 * Loads GLB model with proper shadow configuration.
 */
function PalmTreeModel({
  position,
  rotation = 0,
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}) {
  const { scene } = useGLTF(MODELS.palmTree);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={[0, rotation, 0]}
      scale={scale}
    />
  );
}

/**
 * Procedural palm tree fallback (simple cone + cylinder).
 */
function ProceduralPalmTree({
  position,
  rotation = 0,
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 4, 12]} />
        <meshStandardMaterial color="#5c4a3a" roughness={0.9} />
      </mesh>
      {/* Fronds (simple cones) */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 6) * Math.PI * 2) * 0.8,
            4.2,
            Math.sin((i / 6) * Math.PI * 2) * 0.8,
          ]}
          rotation={[0.8, (i / 6) * Math.PI * 2, 0]}
          castShadow
        >
          <coneGeometry args={[0.3, 2.5, 4]} />
          <meshStandardMaterial color="#3a5a30" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Palm tree with model loading and fallback.
 */
export function PalmTree(props: { position: [number, number, number]; rotation?: number; scale?: number }) {
  return (
    <Suspense fallback={<ProceduralPalmTree {...props} />}>
      <PalmTreeModel {...props} />
    </Suspense>
  );
}

/**
 * Rock model instance.
 */
function RockModel({
  position,
  rotation = 0,
  scale = 1,
  variant = "small",
}: {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
  variant?: "small" | "large";
}) {
  const modelPath = variant === "large" ? MODELS.rockLarge : MODELS.rock;
  const { scene } = useGLTF(modelPath);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={[0, rotation, 0]}
      scale={scale}
    />
  );
}

/**
 * Procedural rock fallback (icosahedron with displacement).
 */
function ProceduralRock({
  position,
  rotation = 0,
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}) {
  return (
    <mesh position={position} rotation={[0.2, rotation, 0.1]} scale={scale} castShadow receiveShadow>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#6b6b6b" roughness={0.85} metalness={0.1} />
    </mesh>
  );
}

/**
 * Rock with model loading and fallback.
 */
export function Rock(props: {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
  variant?: "small" | "large";
}) {
  return (
    <Suspense fallback={<ProceduralRock {...props} />}>
      <RockModel {...props} />
    </Suspense>
  );
}

/**
 * Beach hut / cabana model.
 */
function BeachHutModel({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const { scene } = useGLTF(MODELS.beachHut);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={clonedScene} position={position} rotation={[0, rotation, 0]} />;
}

/**
 * Procedural beach hut fallback.
 */
function ProceduralBeachHut({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Posts */}
      {[[-1, 0, -1], [1, 0, -1], [-1, 0, 1], [1, 0, 1]].map((p, i) => (
        <mesh key={i} position={[p[0], 1.2, p[2]]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 2.4, 8]} />
          <meshStandardMaterial color="#8b7355" roughness={0.9} />
        </mesh>
      ))}
      {/* Roof */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <coneGeometry args={[2, 1.2, 4]} />
        <meshStandardMaterial color="#c4a574" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/**
 * Beach hut with model loading and fallback.
 */
export function BeachHut(props: { position: [number, number, number]; rotation?: number }) {
  return (
    <Suspense fallback={<ProceduralBeachHut {...props} />}>
      <BeachHutModel {...props} />
    </Suspense>
  );
}

/**
 * Dock / pier model.
 */
function DockModel({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const { scene } = useGLTF(MODELS.dock);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={clonedScene} position={position} rotation={[0, rotation, 0]} />;
}

/**
 * Procedural dock fallback.
 */
function ProceduralDock({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Planks */}
      <mesh position={[0, 0.5, -3]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.15, 8]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      {/* Posts */}
      {[-2, 0, 2, 4].map((z, i) => (
        <mesh key={i} position={[0.8, -0.5, -z]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
          <meshStandardMaterial color="#5c4a3a" roughness={0.95} />
        </mesh>
      ))}
      {[-2, 0, 2, 4].map((z, i) => (
        <mesh key={`l${i}`} position={[-0.8, -0.5, -z]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
          <meshStandardMaterial color="#5c4a3a" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Dock with model loading and fallback.
 */
export function Dock(props: { position: [number, number, number]; rotation?: number }) {
  return (
    <Suspense fallback={<ProceduralDock {...props} />}>
      <DockModel {...props} />
    </Suspense>
  );
}

/**
 * All beach scenery elements combined.
 * Positions are designed to match the reference image.
 */
export function BeachScenery() {
  const groundY = sandHeight(0, 0);

  return (
    <group>
      {/* Palm trees - cluster on the left */}
      <PalmTree position={[-8, groundY, 4]} rotation={0.2} scale={1.2} />
      <PalmTree position={[-6, groundY, 6]} rotation={-0.3} scale={1.0} />
      <PalmTree position={[-10, groundY, 3]} rotation={0.5} scale={0.9} />
      <PalmTree position={[-5, groundY, 8]} rotation={1.2} scale={1.1} />

      {/* Palm trees - scattered */}
      <PalmTree position={[12, groundY, 5]} rotation={2.1} scale={0.85} />
      <PalmTree position={[8, groundY, 12]} rotation={-1.5} scale={1.0} />

      {/* Large rocks - left side */}
      <Rock position={[-12, groundY, 2]} rotation={0.4} scale={3.5} variant="large" />
      <Rock position={[-14, groundY + 0.5, 4]} rotation={1.2} scale={2.8} variant="large" />
      <Rock position={[-11, groundY, 6]} rotation={2.3} scale={2.0} variant="large" />

      {/* Rocks - right side */}
      <Rock position={[18, groundY, -2]} rotation={0.8} scale={4.0} variant="large" />
      <Rock position={[20, groundY + 0.3, 0]} rotation={2.1} scale={2.5} variant="large" />

      {/* Small rocks scattered */}
      <Rock position={[-3, groundY, 3]} rotation={1.5} scale={0.4} />
      <Rock position={[4, groundY, 2]} rotation={0.3} scale={0.3} />
      <Rock position={[2, groundY, 5]} rotation={2.8} scale={0.5} />

      {/* Beach hut */}
      <BeachHut position={[0, groundY, 12]} rotation={0.3} />

      {/* Dock extending into water */}
      <Dock position={[15, 0, -4]} rotation={-0.2} />

      {/* Extra coconuts on the ground */}
      <ExtraCoconuts />
    </group>
  );
}

/**
 * Additional coconuts scattered on the beach (not the player).
 */
function ExtraCoconuts() {
  const groundY = sandHeight(0, 0);

  const coconutPositions = useMemo(
    () => [
      { pos: [-4, groundY + 0.15, 2] as [number, number, number], rot: 0.5, scale: 0.28 },
      { pos: [-6, groundY + 0.12, 5] as [number, number, number], rot: 1.2, scale: 0.25 },
      { pos: [3, groundY + 0.14, 4] as [number, number, number], rot: 2.3, scale: 0.26 },
    ],
    [groundY]
  );

  return (
    <>
      {coconutPositions.map((c, i) => (
        <mesh key={i} position={c.pos} rotation={[0.2, c.rot, 0.1]} scale={c.scale} castShadow>
          <sphereGeometry args={[1, 24, 18]} />
          <meshStandardMaterial color="#5a3d25" roughness={0.9} />
        </mesh>
      ))}
    </>
  );
}
