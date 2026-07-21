import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
} from "three";
import { useSimulatorStore } from "../../state/simulatorStore";
import type { EventChannel } from "../../systems/eventHelpers";
import { jungleHeight } from "./terrain";

const CANOPY_GREENS = ["#2e4a26", "#38562c", "#2a4222", "#405e30"];

// Ring the clearing; keep the camera corridor (+x/+z toward the idol) open.
const TREES: [number, number, number, number][] = [
  // [x, z, height, tilt]
  [-5.5, -4, 7.5, 0.06],
  [-8, 1, 8.5, -0.05],
  [-4, -8.5, 9, 0.03],
  [3.5, -7.5, 8, -0.04],
  [7.5, -4.5, 7, 0.07],
  [9.5, 0.5, 8.5, -0.03],
  [-10.5, -6, 10, 0.05],
  [-7, 6.5, 7.5, -0.06],
  [8.5, 6.5, 8, 0.04],
  [12, -8, 9.5, -0.05],
  [-13, 3, 9, 0.06],
  [1, -12, 10, -0.03],
  [-9, -12, 8.5, 0.05],
  [14, 3, 8, -0.04],
  [-16, -3, 9.5, 0.03],
  [6, 11, 7.5, 0.05],
  [-4, 11.5, 8, -0.05],
  [16, -3, 9, 0.06],
];

function JungleTree({ x, z, height, tilt }: { x: number; z: number; height: number; tilt: number }) {
  const y = jungleHeight(x, z);
  const green = CANOPY_GREENS[Math.abs(Math.floor(x * 7 + z * 13)) % CANOPY_GREENS.length];
  return (
    <group position={[x, y, z]} rotation={[0, 0, tilt]}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.3, height, 7]} />
        <meshStandardMaterial color="#4a3c2c" roughness={1} />
      </mesh>
      {/* Buttress roots */}
      {[0, 2.1, 4.2].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.28, 0.3, Math.sin(a) * 0.28]} rotation={[0, -a, 0.5]}>
          <boxGeometry args={[0.5, 0.5, 0.09]} />
          <meshStandardMaterial color="#453727" roughness={1} />
        </mesh>
      ))}
      {/* Canopy layers */}
      <mesh position={[0, height, 0]} castShadow>
        <sphereGeometry args={[1.9, 9, 7]} />
        <meshStandardMaterial color={green} roughness={1} />
      </mesh>
      <mesh position={[1, height - 0.9, 0.4]} castShadow>
        <sphereGeometry args={[1.2, 8, 6]} />
        <meshStandardMaterial color={CANOPY_GREENS[(Math.abs(Math.floor(x * 3))+1) % 4]} roughness={1} />
      </mesh>
      <mesh position={[-0.9, height - 0.7, -0.4]} castShadow>
        <sphereGeometry args={[1.1, 8, 6]} />
        <meshStandardMaterial color={green} roughness={1} />
      </mesh>
    </group>
  );
}

/** ~90 fern fronds as one InstancedMesh, clustered into clumps. */
function makeFerns(): InstancedMesh {
  const clumps: [number, number][] = [
    [-3.2, 0.6],
    [2.6, -1.8],
    [-2, -3.2],
    [4.2, 1],
    [-5.5, 3.2],
    [6.2, -2.5],
    [-6.5, -1.5],
    [3.4, 4.6],
    [-1.5, 5],
    [7.5, 3.2],
    [-8.5, 4.4],
    [5.5, -6],
    [-4.5, -6],
    [10, -1.5],
    [-10.5, 0.5],
  ];
  const geo = new PlaneGeometry(0.16, 0.85);
  geo.translate(0, 0.42, 0);
  const mat = new MeshStandardMaterial({ color: "#3d5a2e", roughness: 1, side: DoubleSide });
  const mesh = new InstancedMesh(geo, mat, clumps.length * 6);
  const dummy = new Object3D();
  let i = 0;
  for (const [cx, cz] of clumps) {
    const y = jungleHeight(cx, cz);
    for (let f = 0; f < 6; f++) {
      const a = (f / 6) * Math.PI * 2 + cx;
      dummy.position.set(cx + Math.cos(a) * 0.08, y, cz + Math.sin(a) * 0.08);
      dummy.rotation.set(0.85, a, 0, "YXZ"); // fronds arch outward
      dummy.scale.setScalar(0.75 + ((f * 37 + cx * 11) % 10) / 18);
      dummy.updateMatrix();
      mesh.setMatrixAt(i++, dummy.matrix);
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

/** Hanging vines as one InstancedMesh of thin cylinders. */
function makeVines(): InstancedMesh {
  const geo = new CylinderGeometry(0.015, 0.008, 1, 4);
  geo.translate(0, -0.5, 0); // hang from the top
  const mat = new MeshStandardMaterial({ color: "#425536", roughness: 1 });
  const count = 34;
  const mesh = new InstancedMesh(geo, mat, count);
  const dummy = new Object3D();
  for (let i = 0; i < count; i++) {
    const tree = TREES[i % TREES.length];
    const [tx, tz, th] = tree;
    dummy.position.set(tx + Math.sin(i * 3.7) * 1.4, jungleHeight(tx, tz) + th - 0.6, tz + Math.cos(i * 2.3) * 1.4);
    dummy.rotation.set(Math.sin(i) * 0.12, 0, Math.cos(i * 1.7) * 0.12);
    dummy.scale.set(1, 2.2 + ((i * 53) % 30) / 8, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

const UNDERGROWTH: [number, number, number][] = [
  [-6.8, -5.5, 0.8],
  [5.8, -5.2, 0.7],
  [-8.8, 2.6, 0.9],
  [8.8, 2, 0.75],
  [-3.5, -9.5, 1.0],
  [2.5, -9.8, 0.85],
  [11, -4.5, 0.9],
  [-11.5, -3, 0.8],
  [7, 8.5, 0.85],
  [-6, 8.8, 0.9],
];

/**
 * The jungle itself: canopy trees, instanced fern clumps, hanging vines
 * and undergrowth. The whole stand sways gently; the windShake event
 * channel drives proper gusts through it.
 */
export function Vegetation({ gust }: { gust?: EventChannel }) {
  const canopyRef = useRef<Group>(null);
  const ferns = useMemo(makeFerns, []);
  const vines = useMemo(makeVines, []);
  const fernsRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (useSimulatorStore.getState().paused) return;
    const t = clock.elapsedTime;
    // Gust envelope rises and falls over the event's duration
    const g = gust?.active ? Math.sin(gust.progress * Math.PI) : 0;
    const sway = 0.006 + g * 0.03;
    if (canopyRef.current) canopyRef.current.rotation.z = Math.sin(t * (1.1 + g * 2)) * sway;
    if (fernsRef.current) fernsRef.current.rotation.x = Math.sin(t * (1.6 + g * 2.5)) * sway * 1.6;
  });

  return (
    <>
      <group ref={canopyRef}>
        {TREES.map(([x, z, h, tilt], i) => (
          <JungleTree key={i} x={x} z={z} height={h} tilt={tilt} />
        ))}
        <primitive object={vines} />
      </group>
      <group ref={fernsRef}>
        <primitive object={ferns} />
      </group>
      {UNDERGROWTH.map(([x, z, s], i) => (
        <mesh key={i} position={[x, jungleHeight(x, z) + s * 0.3, z]} scale={[s, s * 0.6, s]} castShadow>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={i % 2 ? "#324a28" : "#3a5230"} roughness={1} />
        </mesh>
      ))}
    </>
  );
}
