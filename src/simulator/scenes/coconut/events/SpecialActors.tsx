import { useRef } from "react";
import type { Mesh, MeshStandardMaterial, PointLight } from "three";
import { sandHeight } from "../terrain";
import { easeInOut, useEventAnim, type EventChannel } from "../../../systems/eventHelpers";
import { Figure, walk } from "../../../effects/npc";
import type { CoconutChannels } from "./coconutEvents";

/** Tourist strolls the length of the beach behind the coconut. */
function Tourist({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    const x = -12 + easeInOut(p) * 24;
    walk(g, x, sandHeight(x, 3.8), 3.8, t, Math.PI / 2);
  });
  return (
    <group ref={ref} visible={false}>
      <Figure shirt="#a8654a" pants="#d8cba8" />
    </group>
  );
}

/** Someone stops, photographs the coconut, and leaves. Understandable. */
function Photographer({ channel }: { channel: EventChannel }) {
  const flashRef = useRef<PointLight>(null);
  const ref = useEventAnim(channel, (g, p, t) => {
    // Walk in (0-.35), stand and shoot (.35-.65), walk out (.65-1)
    let x: number;
    if (p < 0.35) x = -10 + easeInOut(p / 0.35) * 8;
    else if (p < 0.65) x = -2;
    else x = -2 - easeInOut((p - 0.65) / 0.35) * 8;
    const moving = p < 0.35 || p > 0.65;
    walk(g, x, sandHeight(x, 3), 3, moving ? t : 0, moving ? Math.PI / 2 : Math.PI * 0.85);
    if (flashRef.current) {
      const shooting = p > 0.42 && p < 0.6;
      const blink = shooting && Math.sin(p * 220) > 0.94;
      flashRef.current.intensity = blink ? 14 : 0;
    }
  });
  return (
    <group ref={ref} visible={false}>
      <Figure shirt="#5a6a78" pants="#3c3c38" />
      <mesh position={[0, 1.3, 0.16]}>
        <boxGeometry args={[0.12, 0.08, 0.06]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.4} />
      </mesh>
      <pointLight ref={flashRef} position={[0, 1.3, 0.3]} intensity={0} distance={8} color="#eef2ff" />
    </group>
  );
}

/** Small boat crosses the horizon. */
function Boat({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    g.position.set(-70 + p * 140, 0.1 + Math.sin(t * 0.9) * 0.12, -75);
    g.rotation.z = Math.sin(t * 0.7) * 0.03;
  });
  return (
    <group ref={ref} visible={false} scale={2}>
      <mesh>
        <boxGeometry args={[2.4, 0.5, 0.8]} />
        <meshStandardMaterial color="#5a5048" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 5]} />
        <meshStandardMaterial color="#3c352e" roughness={1} />
      </mesh>
      <mesh position={[0.4, 1.0, 0]} rotation={[0, 0, -0.08]}>
        <planeGeometry args={[0.8, 1.0]} />
        <meshStandardMaterial color="#ddd6c4" roughness={0.9} side={2} />
      </mesh>
    </group>
  );
}

/** A sandcastle rises nearby, exists briefly, and returns to the sand. */
function Sandcastle({ channel }: { channel: EventChannel }) {
  const pos: [number, number] = [2.4, 1.9];
  const ref = useEventAnim(channel, (g, p) => {
    const s = p < 0.25 ? easeInOut(p / 0.25) : p > 0.85 ? 1 - easeInOut((p - 0.85) / 0.15) : 1;
    g.scale.setScalar(Math.max(0.001, s));
    g.position.set(pos[0], sandHeight(pos[0], pos[1]), pos[1]);
  });
  return (
    <group ref={ref} visible={false}>
      {(
        [
          [0, 0, 0, 0.28, 0.5],
          [0.3, 0, 0.15, 0.16, 0.34],
          [-0.28, 0, 0.12, 0.16, 0.3],
        ] as const
      ).map(([x, , z, r, h], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, h / 2, 0]} castShadow>
            <cylinderGeometry args={[r, r * 1.15, h, 10]} />
            <meshStandardMaterial color="#cbb488" roughness={1} />
          </mesh>
          <mesh position={[0, h + r * 0.55, 0]} castShadow>
            <coneGeometry args={[r * 1.1, r * 1.2, 10]} />
            <meshStandardMaterial color="#c2ab7e" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** RARE: full-rigged silhouette on the horizon. No flag. No explanation. */
function PirateShip({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    g.position.set(-90 + p * 180, 0.2 + Math.sin(t * 0.6) * 0.2, -95);
    g.rotation.z = Math.sin(t * 0.5) * 0.02;
  });
  return (
    <group ref={ref} visible={false} scale={4.5}>
      <mesh>
        <boxGeometry args={[3.2, 0.7, 0.9]} />
        <meshStandardMaterial color="#2e2620" roughness={1} />
      </mesh>
      {[-1, 0, 1].map((m) => (
        <group key={m} position={[m * 0.9, 0, 0]}>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 2.2, 5]} />
            <meshStandardMaterial color="#241d16" roughness={1} />
          </mesh>
          <mesh position={[0, 1.35, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.9, 1.1]} />
            <meshStandardMaterial color="#9a8f7c" roughness={1} side={2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** RARE: it does not stop for the coconut. */
function UFO({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    g.position.set(-45 + p * 90, 16 + Math.sin(p * Math.PI * 3) * 1.6, -35);
    g.rotation.z = Math.sin(t * 3) * 0.1;
    g.rotation.y = t * 2;
  });
  return (
    <group ref={ref} visible={false} scale={1.6}>
      <mesh scale={[1, 0.22, 1]}>
        <sphereGeometry args={[1, 20, 12]} />
        <meshStandardMaterial color="#8a92a0" roughness={0.25} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.16, 0]} scale={[0.45, 0.3, 0.45]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#b8c8d8" roughness={0.1} metalness={0.5} emissive="#3a4a6a" />
      </mesh>
      <pointLight position={[0, -0.5, 0]} intensity={6} distance={25} color="#9fd8b0" />
    </group>
  );
}

/** RARE: a figure sprints across the beach at implausible speed. */
function StrangeRunner({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    const x = -14 + p * 28;
    g.position.set(x, sandHeight(x, 2.8) + Math.abs(Math.sin(t * 16)) * 0.1, 2.8);
    g.rotation.set(0.28, Math.PI / 2, Math.sin(t * 16) * 0.12);
  });
  return (
    <group ref={ref} visible={false} scale={[1, 1.25, 1]}>
      <Figure shirt="#1a1a1a" pants="#1a1a1a" />
    </group>
  );
}

/** RARE: a giant wave builds far offshore… and politely dissipates. */
function GiantWave({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p) => {
    const rise = Math.sin(Math.min(1, p * 1.6) * Math.PI);
    g.position.set(0, rise * 4 - 4.2, -60 + p * 25);
    g.scale.set(1, Math.max(0.001, rise), 1);
    const mesh = g.children[0] as Mesh;
    (mesh.material as MeshStandardMaterial).opacity = Math.min(0.85, rise);
  });
  return (
    <group ref={ref} visible={false}>
      <mesh rotation={[0.35, 0, 0]}>
        <planeGeometry args={[90, 9, 24, 4]} />
        <meshStandardMaterial color="#2a7a92" transparent opacity={0} roughness={0.3} side={2} />
      </mesh>
      <mesh position={[0, 4.6, 0.6]} rotation={[-0.4, 0, 0]}>
        <planeGeometry args={[88, 1.6]} />
        <meshStandardMaterial color="#e6f2f0" transparent opacity={0.5} roughness={0.5} side={2} />
      </mesh>
    </group>
  );
}

export function SpecialActors({ channels }: { channels: CoconutChannels }) {
  return (
    <>
      <Tourist channel={channels.tourist} />
      <Photographer channel={channels.photographer} />
      <Boat channel={channels.boat} />
      <Sandcastle channel={channels.sandcastle} />
      <PirateShip channel={channels.pirateShip} />
      <UFO channel={channels.ufo} />
      <StrangeRunner channel={channels.strangeRunner} />
      <GiantWave channel={channels.giantWave} />
    </>
  );
}
