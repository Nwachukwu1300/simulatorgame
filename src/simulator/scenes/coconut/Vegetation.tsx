import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, PlaneGeometry } from "three";
import { sandHeight } from "./terrain";
import { useSimulatorStore } from "../../state/simulatorStore";

/** A single frond: a plane bent lengthwise into a drooping curve. */
function useFrondGeometry() {
  return useMemo(() => {
    const geo = new PlaneGeometry(2.0, 0.42, 10, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i); // -1 .. 1 along the frond
      const t = (x + 1) / 2;
      pos.setY(i, pos.getY(i) * (1 - t * 0.7)); // taper toward tip
      pos.setZ(i, -Math.pow(t, 1.8) * 0.9); // droop
    }
    geo.translate(1.0, 0, 0); // pivot at the base
    geo.computeVertexNormals();
    return geo;
  }, []);
}

function PalmTree({
  position,
  lean = 0.22,
  height = 5,
  seed = 0,
}: {
  position: [number, number];
  lean?: number;
  height?: number;
  seed?: number;
}) {
  const frond = useFrondGeometry();
  const crown = useRef<Group>(null);
  const segments = 6;
  const [px, pz] = position;
  const baseY = sandHeight(px, pz);

  // Wind sway on the crown only (cheap, sells the whole scene)
  useFrame(({ clock }) => {
    if (useSimulatorStore.getState().paused) return;
    if (crown.current) {
      const t = clock.elapsedTime + seed * 7;
      crown.current.rotation.z = Math.sin(t * 0.7) * 0.03 + Math.sin(t * 1.9) * 0.012;
      crown.current.rotation.x = Math.cos(t * 0.5) * 0.025;
    }
  });

  // Curved trunk from stacked, progressively-offset cylinder segments
  const segs = [];
  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    segs.push({
      pos: [Math.pow(t, 1.6) * lean * height, baseY + (t + 0.5 / segments) * height * 0.95, 0] as [
        number,
        number,
        number,
      ],
      rot: -Math.pow(t, 0.8) * lean * 0.9,
      r: 0.14 * (1 - t * 0.45),
    });
  }
  const top = segs[segments - 1];
  const crownPos: [number, number, number] = [
    top.pos[0] + Math.sin(top.rot) * 0.4,
    top.pos[1] + 0.45,
    0,
  ];

  return (
    <group position={[px, 0, pz]} rotation={[0, seed * 2.1, 0]}>
      {segs.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={[0, 0, s.rot]} castShadow>
          <cylinderGeometry args={[s.r * 0.92, s.r, (height / segments) * 1.15, 7]} />
          <meshStandardMaterial color="#7a6248" roughness={1} />
        </mesh>
      ))}
      <group ref={crown} position={crownPos}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={i}
              geometry={frond}
              rotation={[Math.sin(a) * 0.5, a, -0.35 - (i % 3) * 0.14]}
              castShadow
            >
              <meshStandardMaterial color={i % 2 ? "#3e6b34" : "#48793b"} roughness={0.9} side={2} />
            </mesh>
          );
        })}
        {/* Coconut cluster (the player's extended family) */}
        {Array.from({ length: 3 }, (_, i) => (
          <mesh key={i} position={[Math.cos(i * 2.1) * 0.2, -0.15, Math.sin(i * 2.1) * 0.2]} castShadow>
            <sphereGeometry args={[0.14, 10, 8]} />
            <meshStandardMaterial color="#5e4526" roughness={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Small crossed-plane grass tufts and broad-leaf plants on the upper beach. */
function Tufts() {
  const tufts = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => {
        const x = -30 + ((i * 7.13) % 60) + Math.sin(i * 9.7) * 3;
        const z = 4 + ((i * 3.71) % 16); // only on the upper/dry beach
        return { x, z, y: sandHeight(x, z), s: 0.5 + ((i * 0.37) % 0.6), r: i * 1.3 };
      }),
    [],
  );
  return (
    <>
      {tufts.map((t, i) => (
        <group key={i} position={[t.x, t.y, t.z]} rotation={[0, t.r, 0]} scale={t.s}>
          {[0, Math.PI / 3, -Math.PI / 3].map((a, j) => (
            <mesh key={j} rotation={[0, a, 0]} position={[0, 0.22, 0]}>
              <planeGeometry args={[0.5, 0.45]} />
              <meshStandardMaterial color={j ? "#6c7c46" : "#7d8b50"} roughness={1} side={2} alphaTest={0.1} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

export function Vegetation() {
  return (
    <>
      <PalmTree position={[-4.5, 3.5]} lean={0.3} height={5.2} seed={1} />
      <PalmTree position={[3.8, 6]} lean={0.2} height={4.4} seed={2} />
      <PalmTree position={[8.5, 4]} lean={0.35} height={5.8} seed={3} />
      <PalmTree position={[-10, 7]} lean={0.15} height={4.8} seed={4} />
      <PalmTree position={[14, 9]} lean={0.28} height={5.4} seed={5} />
      <Tufts />
    </>
  );
}
