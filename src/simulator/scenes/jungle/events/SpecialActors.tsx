import { useRef } from "react";
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight } from "three";
import { easeInOut, useEventAnim, type EventChannel } from "../../../systems/eventHelpers";
import { Figure, walk } from "../../../effects/npc";
import { rotorPass } from "../../../engine/proceduralAudio";
import { jungleHeight, pathCenter } from "../terrain";
import { DIG_SPOT, TORCH_POS } from "../Ruins";
import type { JungleChannels } from "./jungleEvents";

/** Explorer follows the path, pausing to check bearings. */
function Explorer({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    // walk - pause at the idol - walk on
    let q: number;
    if (p < 0.4) q = easeInOut(p / 0.4) * 0.45;
    else if (p < 0.6) q = 0.45;
    else q = 0.45 + easeInOut((p - 0.6) / 0.4) * 0.55;
    const x = -12 + q * 24;
    const z = pathCenter(x);
    const pausing = p >= 0.4 && p < 0.6;
    walk(g, x, jungleHeight(x, z), z, pausing ? 0 : t, pausing ? Math.PI : Math.PI / 2);
    if (pausing) g.rotation.y = Math.PI + Math.sin(t * 0.7) * 0.4; // taking it in
  });
  return (
    <group ref={ref} visible={false}>
      <Figure shirt="#8a7a52" pants="#5e5240" />
      {/* wide-brim hat */}
      <mesh position={[0, 1.62, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.02, 10]} />
        <meshStandardMaterial color="#6e5c3a" roughness={1} />
      </mesh>
      <mesh position={[0, 1.66, 0]}>
        <cylinderGeometry args={[0.1, 0.11, 0.1, 8]} />
        <meshStandardMaterial color="#6e5c3a" roughness={1} />
      </mesh>
      {/* rucksack */}
      <mesh position={[0, 1.05, -0.2]}>
        <boxGeometry args={[0.24, 0.32, 0.14]} />
        <meshStandardMaterial color="#4a5238" roughness={1} />
      </mesh>
    </group>
  );
}

/** Archaeologist kneels at the dig spot and brushes at the centuries. */
function Archaeologist({ channel }: { channel: EventChannel }) {
  const [dx, , dz] = DIG_SPOT;
  const groundY = jungleHeight(dx, dz);
  const ref = useEventAnim(channel, (g, p, t) => {
    if (p < 0.12) {
      const q = easeInOut(p / 0.12);
      const x = -13 + q * (dx + 13);
      walk(g, x, jungleHeight(x, dz + 0.8), dz + 0.8, t, Math.PI / 2);
      g.scale.y = 1;
    } else if (p > 0.9) {
      const q = easeInOut((p - 0.9) / 0.1);
      const x = dx - q * 10;
      walk(g, x, jungleHeight(x, dz + 0.8), dz + 0.8, t, -Math.PI / 2);
      g.scale.y = 1;
    } else {
      // kneeling: compressed figure, small brushing oscillation
      g.position.set(dx, groundY - 0.28, dz);
      g.rotation.set(0.18, Math.PI * 0.75, Math.sin(t * 5.5) * 0.02);
      g.scale.y = 0.72;
    }
  });
  return (
    <group ref={ref} visible={false}>
      <Figure shirt="#9a8a68" pants="#5e5648" />
      {/* clipboard of important stratigraphy */}
      <mesh position={[0.2, 0.95, 0.18]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.14, 0.2, 0.015]} />
        <meshStandardMaterial color="#c9bfa8" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** A deer steps out of the trees. Neither of you moves much. */
function Deer({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    // emerge (0-.3), alert stillness (.3-.7), retreat (.7-1)
    let q: number;
    if (p < 0.3) q = easeInOut(p / 0.3) * 0.5;
    else if (p < 0.7) q = 0.5;
    else q = 0.5 - easeInOut((p - 0.7) / 0.3) * 0.6;
    const x = -9 + q * 5;
    const z = -3.5;
    const still = p >= 0.3 && p < 0.7;
    g.position.set(x, jungleHeight(x, z) + (still ? 0 : Math.abs(Math.sin(t * 4)) * 0.03), z);
    g.rotation.y = p < 0.7 ? Math.PI / 2 : -Math.PI / 2;
    // head lifts while alert
    (g.children[1] as Group).rotation.z = still ? 0.35 : 0;
  });
  return (
    <group ref={ref} visible={false}>
      {/* body */}
      <mesh position={[0, 0.62, 0]} scale={[1.8, 1, 0.9]} castShadow>
        <sphereGeometry args={[0.19, 10, 8]} />
        <meshStandardMaterial color="#8a6a44" roughness={1} />
      </mesh>
      {/* neck + head */}
      <group position={[0.28, 0.75, 0]}>
        <mesh position={[0.06, 0.16, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.045, 0.06, 0.4, 6]} />
          <meshStandardMaterial color="#8a6a44" roughness={1} />
        </mesh>
        <mesh position={[0.16, 0.34, 0]} scale={[1.4, 0.9, 0.8]}>
          <sphereGeometry args={[0.07, 8, 6]} />
          <meshStandardMaterial color="#7e6040" roughness={1} />
        </mesh>
        {/* modest antlers */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.12, 0.44, s * 0.04]} rotation={[s * 0.5, 0, 0.5]}>
            <cylinderGeometry args={[0.008, 0.012, 0.2, 4]} />
            <meshStandardMaterial color="#5e4c32" roughness={1} />
          </mesh>
        ))}
      </group>
      {/* legs */}
      {[
        [0.24, 0.09],
        [0.24, -0.09],
        [-0.24, 0.09],
        [-0.24, -0.09],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.26, lz]}>
          <cylinderGeometry args={[0.022, 0.018, 0.52, 5]} />
          <meshStandardMaterial color="#7e6040" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/** The mist parts; a waterfall was always there, on the far ridge. */
function Waterfall({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    const vis = Math.sin(Math.min(1, p) * Math.PI);
    const fall = g.children[0] as Mesh;
    const pool = g.children[1] as Mesh;
    (fall.material as MeshStandardMaterial).opacity = vis * 0.75;
    (pool.material as MeshStandardMaterial).opacity = vis * 0.5;
    // shimmer: the sheet ripples subtly
    fall.scale.x = 1 + Math.sin(t * 5) * 0.04;
  });
  return (
    <group ref={ref} visible={false} position={[22, 0, -55]}>
      <mesh position={[0, 9, 0]}>
        <planeGeometry args={[2.6, 18, 4, 12]} />
        <meshStandardMaterial color="#dcecea" transparent opacity={0} roughness={0.25} side={2} />
      </mesh>
      <mesh position={[0, 0.3, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.4, 14]} />
        <meshStandardMaterial color="#e8f4f2" transparent opacity={0} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** Campfire smoke rises beyond the trees. Someone else is out here. */
function Campfire({ channel }: { channel: EventChannel }) {
  const glowRef = useRef<PointLight>(null);
  const ref = useEventAnim(channel, (g, p, t) => {
    const vis = p < 0.1 ? p / 0.1 : p > 0.85 ? (1 - p) / 0.15 : 1;
    g.children.forEach((puff, i) => {
      if (i >= 5) return;
      const cycle = (t * 0.35 + i / 5) % 1;
      puff.position.set(Math.sin(cycle * 4 + i) * (0.4 + cycle * 1.6), 1 + cycle * 7, 0);
      puff.scale.setScalar(0.6 + cycle * 2.4);
      ((puff as Mesh).material as MeshBasicMaterial).opacity = vis * 0.3 * (1 - cycle);
    });
    if (glowRef.current) {
      glowRef.current.intensity = vis * (1.6 + Math.sin(t * 9) * 0.5);
    }
  });
  return (
    <group ref={ref} visible={false} position={[-24, 0, -34]}>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.8, 7, 6]} />
          <meshBasicMaterial color="#8a8a86" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
      <pointLight ref={glowRef} position={[0, 0.6, 0]} intensity={0} distance={9} color="#ff8a3a" />
    </group>
  );
}

/** RARE: the jaguar crosses upwind. It knows exactly where you are. */
function Jaguar({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    // slink (0-.45), stop and look at you (.45-.65), gone (.65-1)
    let q: number;
    if (p < 0.45) q = easeInOut(p / 0.45) * 0.55;
    else if (p < 0.65) q = 0.55;
    else q = 0.55 + easeInOut((p - 0.65) / 0.35) * 0.45;
    const x = -9 + q * 14;
    const z = -6;
    const still = p >= 0.45 && p < 0.65;
    g.position.set(x, jungleHeight(x, z) + (still ? 0 : Math.abs(Math.sin(t * 5)) * 0.02), z);
    g.rotation.y = Math.PI / 2;
    // the head turns toward the clearing. toward you.
    (g.children[1] as Group).rotation.y = still ? -0.9 : 0;
  });
  return (
    <group ref={ref} visible={false}>
      {/* long low body */}
      <mesh position={[0, 0.42, 0]} scale={[2.3, 0.9, 0.85]} castShadow>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshStandardMaterial color="#b07a2e" roughness={0.95} />
      </mesh>
      {/* head */}
      <group position={[0.44, 0.5, 0]}>
        <mesh scale={[1.1, 0.9, 0.9]}>
          <sphereGeometry args={[0.11, 9, 7]} />
          <meshStandardMaterial color="#a8702a" roughness={0.95} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 0.1, s * 0.06]}>
            <coneGeometry args={[0.025, 0.05, 4]} />
            <meshStandardMaterial color="#96622a" roughness={1} />
          </mesh>
        ))}
      </group>
      {/* tail low and long */}
      <mesh position={[-0.5, 0.42, 0]} rotation={[0, 0, 1.2]}>
        <cylinderGeometry args={[0.02, 0.035, 0.5, 5]} />
        <meshStandardMaterial color="#a8702a" roughness={1} />
      </mesh>
      {/* legs */}
      {[
        [0.3, 0.1],
        [0.3, -0.1],
        [-0.3, 0.1],
        [-0.3, -0.1],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.18, lz]}>
          <cylinderGeometry args={[0.03, 0.026, 0.36, 5]} />
          <meshStandardMaterial color="#a8702a" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/** RARE: the ancient torch lights itself. No wind arrives to excuse it. */
function Torch({ channel }: { channel: EventChannel }) {
  const lightRef = useRef<PointLight>(null);
  const ref = useEventAnim(channel, (g, p, t) => {
    const vis = p < 0.1 ? easeInOut(p / 0.1) : p > 0.85 ? 1 - easeInOut((p - 0.85) / 0.15) : 1;
    const flame = g.children[0] as Mesh;
    flame.scale.set(vis, vis * (1 + Math.sin(t * 11) * 0.18), vis);
    if (lightRef.current) {
      lightRef.current.intensity = vis * (2.6 + Math.sin(t * 13) * 0.7 + Math.sin(t * 31) * 0.3);
    }
  });
  const y = jungleHeight(TORCH_POS[0], TORCH_POS[2]);
  return (
    <group ref={ref} visible={false} position={[TORCH_POS[0], y + 1.48, TORCH_POS[2]]}>
      <mesh>
        <coneGeometry args={[0.07, 0.26, 7]} />
        <meshStandardMaterial color="#ffb23a" emissive="#ff7a1a" emissiveIntensity={2.2} roughness={0.6} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.15, 0]} intensity={0} distance={9} decay={1.7} color="#ff9a4a" />
    </group>
  );
}

/** RARE: a helicopter crosses the canopy gap. Surveying? Searching? */
function Helicopter({ channel }: { channel: EventChannel }) {
  const started = useRef(false);
  const ref = useEventAnim(channel, (g, p, t) => {
    if (p < 0.02) started.current = false;
    if (!started.current && p >= 0.02) {
      started.current = true;
      rotorPass(13);
    }
    g.position.set(-45 + p * 90, 24 + Math.sin(p * Math.PI) * 2, -22);
    g.rotation.z = -0.08;
    (g.children[1] as Mesh).rotation.y = t * 30; // main rotor
    (g.children[3] as Mesh).rotation.x = t * 34; // tail rotor
  });
  return (
    <group ref={ref} visible={false} scale={1.6}>
      {/* cabin */}
      <mesh scale={[1.7, 0.85, 0.85]}>
        <sphereGeometry args={[0.5, 12, 9]} />
        <meshStandardMaterial color="#3c4a3c" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* main rotor */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[3.2, 0.02, 0.12]} />
        <meshStandardMaterial color="#22261f" roughness={0.6} />
      </mesh>
      {/* tail boom */}
      <mesh position={[-1.1, 0.1, 0]} rotation={[0, 0, 0.06]}>
        <cylinderGeometry args={[0.06, 0.12, 1.6, 6]} />
        <meshStandardMaterial color="#3c4a3c" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* tail rotor */}
      <mesh position={[-1.85, 0.18, 0.08]}>
        <boxGeometry args={[0.02, 0.7, 0.08]} />
        <meshStandardMaterial color="#22261f" roughness={0.6} />
      </mesh>
      {/* skids */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, -0.5, s * 0.3]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 1.4, 5]} />
          <meshStandardMaterial color="#2a2e26" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/** RARE: someone crashes through the undergrowth, checking behind them. */
function LostExplorer({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    const x = -13 + p * 26;
    const z = 2 + Math.sin(p * Math.PI * 3) * 1.4;
    g.position.set(x, jungleHeight(x, z) + Math.abs(Math.sin(t * 14)) * 0.09, z);
    // glances over the shoulder twice
    const glance = Math.sin(p * Math.PI * 4) > 0.7 ? -1.4 : 0;
    g.rotation.set(0.24, Math.PI / 2 + glance, Math.sin(t * 14) * 0.1);
  });
  return (
    <group ref={ref} visible={false}>
      <Figure shirt="#8a7a52" pants="#5e5240" />
      {/* hat, barely holding on */}
      <mesh position={[0, 1.6, -0.06]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 10]} />
        <meshStandardMaterial color="#6e5c3a" roughness={1} />
      </mesh>
    </group>
  );
}

/** RARE: a meteor crosses the sky. The idol has counted thousands. */
function Meteor({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p) => {
    g.position.set(-35 + p * 70, 34 - p * 16, -45);
    const fade = Math.sin(Math.min(1, p) * Math.PI);
    ((g.children[0] as Mesh).material as MeshBasicMaterial).opacity = fade;
    ((g.children[1] as Mesh).material as MeshBasicMaterial).opacity = fade * 0.5;
  });
  return (
    <group ref={ref} visible={false} rotation={[0, 0, -0.23]}>
      <mesh>
        <sphereGeometry args={[0.22, 8, 6]} />
        <meshBasicMaterial color="#fff6dc" transparent opacity={0} fog={false} />
      </mesh>
      <mesh position={[2.6, 0, 0]}>
        <planeGeometry args={[5.2, 0.16]} />
        <meshBasicMaterial color="#ffdf9a" transparent opacity={0} fog={false} side={2} />
      </mesh>
    </group>
  );
}

/** RARE: a pale figure stands beyond the columns, then is not there. */
function GlowingFigure({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    // materialise (0-.25), drift toward the temple (.25-.8), gone (.8-1)
    const vis = p < 0.25 ? easeInOut(p / 0.25) : p > 0.8 ? 1 - easeInOut((p - 0.8) / 0.2) : 1;
    const drift = p < 0.25 ? 0 : easeInOut(Math.min(1, (p - 0.25) / 0.55));
    const x = -4.6 + drift * 1.8;
    const z = -6 - drift * 5;
    g.position.set(x, jungleHeight(x, z) + Math.sin(t * 1.1) * 0.04, z);
    g.rotation.y = 0.6;
    g.children.forEach((part) => {
      const m = (part as Mesh).material as MeshStandardMaterial;
      m.opacity = vis * 0.55;
      m.emissiveIntensity = 0.9 + Math.sin(t * 2.1) * 0.35;
    });
  });
  return (
    <group ref={ref} visible={false}>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.16, 0.24, 1.5, 8]} />
        <meshStandardMaterial color="#d8e8d0" emissive="#a8d8b0" emissiveIntensity={1} transparent opacity={0} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.62, 0]}>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial color="#d8e8d0" emissive="#a8d8b0" emissiveIntensity={1} transparent opacity={0} roughness={0.8} />
      </mesh>
    </group>
  );
}

export function SpecialActors({ channels }: { channels: JungleChannels }) {
  return (
    <>
      <Explorer channel={channels.explorer} />
      <Archaeologist channel={channels.archaeologist} />
      <Deer channel={channels.deer} />
      <Waterfall channel={channels.waterfall} />
      <Campfire channel={channels.campfire} />
      <Jaguar channel={channels.jaguar} />
      <Torch channel={channels.torch} />
      <Helicopter channel={channels.helicopter} />
      <LostExplorer channel={channels.lostExplorer} />
      <Meteor channel={channels.meteor} />
      <GlowingFigure channel={channels.glowingFigure} />
    </>
  );
}
