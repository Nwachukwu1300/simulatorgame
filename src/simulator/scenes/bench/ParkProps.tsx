import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  CylinderGeometry,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  SphereGeometry,
} from "three";
import { useSimulatorStore } from "../../state/simulatorStore";
import { getDaylightFactor } from "../../systems/TimeSystem";
import { parkHeight } from "./terrain";
import { ParkBench } from "./Bench";

/** The bench the couple event uses — actors need its exact spot. */
export const COUPLE_BENCH: [number, number, number] = [5.6, 0, 3.9];

// ── Trees ─────────────────────────────────────────────────────────────

const AUTUMN_PALETTES: [string, string, string][] = [
  ["#8a7a2e", "#b8862e", "#a05a24"],
  ["#7a8a34", "#8a7a2e", "#b8862e"],
  ["#a05a24", "#b8742a", "#8a6a28"],
  ["#6a7a30", "#8a8a34", "#a8862e"],
];

const TREES: [number, number, number, number][] = [
  // [x, z, scale, paletteIndex]
  [-6, -6, 1.2, 0],
  [-12, -3, 1.5, 1],
  [7.5, -7, 1.35, 2],
  [13, -2, 1.1, 3],
  [-16, 6.5, 1.4, 2],
  [10.5, 7.5, 1.25, 0],
  [17, -9, 1.6, 1],
  [-4, -13, 1.5, 3],
  [4.5, -15, 1.3, 0],
  [19, 5, 1.2, 2],
  [-21, -9, 1.7, 1],
  [-9, 9, 1.15, 3],
];

function Tree({ x, z, scale, palette }: { x: number; z: number; scale: number; palette: number }) {
  const [c1, c2, c3] = AUTUMN_PALETTES[palette];
  const y = parkHeight(x, z);
  return (
    <group position={[x, y, z]} scale={scale}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.16, 2.3, 7]} />
        <meshStandardMaterial color="#4a3a2a" roughness={1} />
      </mesh>
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[1.05, 10, 8]} />
        <meshStandardMaterial color={c1} roughness={1} />
      </mesh>
      <mesh position={[0.55, 2.1, 0.3]} castShadow>
        <sphereGeometry args={[0.7, 9, 7]} />
        <meshStandardMaterial color={c2} roughness={1} />
      </mesh>
      <mesh position={[-0.5, 2.2, -0.25]} castShadow>
        <sphereGeometry args={[0.65, 9, 7]} />
        <meshStandardMaterial color={c3} roughness={1} />
      </mesh>
    </group>
  );
}

// ── Bushes ────────────────────────────────────────────────────────────

const BUSHES: [number, number, number][] = [
  [-8.5, 4.8, 0.9],
  [13.5, 4.5, 0.75],
  [-2.2, -4.5, 0.8],
  [5.2, -5.5, 0.7],
  [-14, -8, 1.0],
  [9, -11, 0.85],
  [-18, 1, 0.9],
];

function Bushes() {
  return (
    <>
      {BUSHES.map(([x, z, s], i) => (
        <mesh key={i} position={[x, parkHeight(x, z) + s * 0.28, z]} scale={[s, s * 0.62, s]} castShadow>
          <sphereGeometry args={[1, 9, 7]} />
          <meshStandardMaterial color={i % 2 ? "#4a6030" : "#556a2e"} roughness={1} />
        </mesh>
      ))}
    </>
  );
}

// ── Flower beds (instanced) ───────────────────────────────────────────

const FLOWER_COLORS = ["#c0483a", "#d8a03a", "#b05a90", "#e0ded0"];
const BEDS: [number, number, number][] = [
  [-3.2, 4.4, 1.3],
  [8.4, 4.6, 1.1],
  [-11, 5.6, 0.9],
];

function Flowers() {
  const mesh = useMemo(() => {
    const perBed = 26;
    const geo = new SphereGeometry(0.05, 6, 5);
    const mat = new MeshStandardMaterial({ roughness: 0.9 });
    const m = new InstancedMesh(geo, mat, perBed * BEDS.length);
    const dummy = new Object3D();
    const color = new Color();
    let idx = 0;
    for (const [bx, bz, r] of BEDS) {
      for (let i = 0; i < perBed; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.sqrt(Math.random()) * r;
        const x = bx + Math.cos(a) * d;
        const z = bz + Math.sin(a) * d;
        dummy.position.set(x, parkHeight(x, z) + 0.09 + Math.random() * 0.05, z);
        dummy.scale.setScalar(0.8 + Math.random() * 0.6);
        dummy.updateMatrix();
        m.setMatrixAt(idx, dummy.matrix);
        color.set(FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)]);
        m.setColorAt(idx, color);
        idx++;
      }
    }
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, []);
  return <primitive object={mesh} />;
}

// ── Lamp posts (lit at night) ─────────────────────────────────────────

const LAMPS: [number, number][] = [
  [-12, 3.6],
  [-4.5, 3.6],
  [4, 3.6],
  [12, 3.6],
];

function LampPosts() {
  const lightRefs = useRef<(PointLight | null)[]>([]);
  const headMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#d8d2c0",
        emissive: new Color("#ffdf9a"),
        emissiveIntensity: 0,
        roughness: 0.4,
      }),
    [],
  );

  useFrame(() => {
    const { timeOfDay } = useSimulatorStore.getState();
    const daylight = getDaylightFactor(timeOfDay);
    const on = Math.max(0, 1 - daylight * 4); // fades in around dusk
    headMat.emissiveIntensity = on * 1.4;
    lightRefs.current.forEach((l) => {
      if (l) l.intensity = on * 5.5;
    });
  });

  return (
    <>
      {LAMPS.map(([x, z], i) => {
        const y = parkHeight(x, z);
        return (
          <group key={i} position={[x, y, z]}>
            <mesh position={[0, 1.55, 0]} castShadow>
              <cylinderGeometry args={[0.035, 0.055, 3.1, 8]} />
              <meshStandardMaterial color="#26312c" roughness={0.6} metalness={0.5} />
            </mesh>
            <mesh position={[0, 3.16, 0]} material={headMat}>
              <sphereGeometry args={[0.13, 10, 8]} />
            </mesh>
            <mesh position={[0, 3.28, 0]} castShadow>
              <coneGeometry args={[0.19, 0.16, 8]} />
              <meshStandardMaterial color="#26312c" roughness={0.6} metalness={0.5} />
            </mesh>
            <pointLight
              ref={(l) => (lightRefs.current[i] = l)}
              position={[0, 3.05, 0]}
              intensity={0}
              distance={11}
              decay={1.6}
              color="#ffd890"
            />
          </group>
        );
      })}
    </>
  );
}

// ── Perimeter fence (instanced pickets + rails) ───────────────────────

const FENCE_Z = -28;
const FENCE_SPAN = 48;

function Fence() {
  const pickets = useMemo(() => {
    const count = Math.floor((FENCE_SPAN * 2) / 1.4) + 1;
    const geo = new CylinderGeometry(0.025, 0.025, 1.15, 5);
    const mat = new MeshStandardMaterial({ color: "#232b26", roughness: 0.55, metalness: 0.6 });
    const m = new InstancedMesh(geo, mat, count);
    const dummy = new Object3D();
    for (let i = 0; i < count; i++) {
      const x = -FENCE_SPAN + i * 1.4;
      dummy.position.set(x, parkHeight(x, FENCE_Z) + 0.57, FENCE_Z);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, []);

  return (
    <group>
      <primitive object={pickets} />
      {[0.35, 1.05].map((y) => (
        <mesh key={y} position={[0, y, FENCE_Z]}>
          <boxGeometry args={[FENCE_SPAN * 2, 0.05, 0.04]} />
          <meshStandardMaterial color="#232b26" roughness={0.55} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// ── Assembly ──────────────────────────────────────────────────────────

/** Everything in Meridian Park that is not the lawn, the sky or you. */
export function ParkProps() {
  return (
    <>
      {TREES.map(([x, z, s, p], i) => (
        <Tree key={i} x={x} z={z} scale={s} palette={p} />
      ))}
      <Bushes />
      <Flowers />
      <LampPosts />
      <Fence />
      {/* Other benches. They face the path, as benches do. */}
      <ParkBench position={[-8.2, parkHeight(-8.2, 3.9), 3.9]} rotationY={Math.PI} weathered />
      <ParkBench position={COUPLE_BENCH} rotationY={Math.PI} weathered />
      <ParkBench position={[11.5, parkHeight(11.5, 3.9), 3.9]} rotationY={Math.PI} weathered />
      {/* A public bin. Municipal realism. */}
      <mesh position={[-1.9, 0.32, 3.7]} castShadow>
        <cylinderGeometry args={[0.22, 0.19, 0.64, 10]} />
        <meshStandardMaterial color="#2e3b32" roughness={0.7} metalness={0.3} />
      </mesh>
    </>
  );
}
