import { easeInOut, useEventAnim, type EventChannel } from "../../../systems/eventHelpers";
import { jungleHeight } from "../terrain";
import type { JungleChannels } from "./jungleEvents";

/** Butterfly wanders past the idol on an indecisive route. */
function Butterfly({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    g.position.set(
      -5 + p * 10 + Math.sin(t * 1.9) * 0.5,
      1.1 + Math.sin(t * 2.7) * 0.35 + Math.sin(p * Math.PI) * 0.3,
      1.2 + Math.cos(t * 1.3) * 0.8,
    );
    const flap = Math.sin(t * 22) * 1.1;
    g.children[0].rotation.y = flap;
    g.children[1].rotation.y = -flap;
    g.rotation.y = Math.sin(t * 0.8) * 0.6;
  });
  return (
    <group ref={ref} visible={false}>
      {[1, -1].map((s, i) => (
        <mesh key={i} position={[s * 0.01, 0, 0]}>
          <planeGeometry args={[0.09, 0.12]} />
          <meshStandardMaterial color="#3a6ea8" roughness={0.8} side={2} />
        </mesh>
      ))}
      <mesh scale={[0.4, 1, 0.4]}>
        <sphereGeometry args={[0.02, 6, 5]} />
        <meshStandardMaterial color="#1c1c1c" roughness={1} />
      </mesh>
    </group>
  );
}

/** Monkey crosses the canopy in long dipping swings. */
function Monkey({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    const x = -11 + p * 22;
    const dip = Math.abs(Math.sin(p * Math.PI * 4));
    g.position.set(x, 6.2 - dip * 1.4, -4.5);
    g.rotation.z = Math.sin(p * Math.PI * 8) * 0.5; // swing pendulum
    g.children[1].rotation.x = 0.6 + Math.sin(t * 6) * 0.3; // tail
  });
  return (
    <group ref={ref} visible={false}>
      <mesh castShadow scale={[1, 1.25, 0.9]}>
        <sphereGeometry args={[0.14, 9, 7]} />
        <meshStandardMaterial color="#4e3c28" roughness={1} />
      </mesh>
      {/* tail */}
      <mesh position={[0, -0.05, -0.18]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.03, 0.4, 5]} />
        <meshStandardMaterial color="#443422" roughness={1} />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.2, 0.06]}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshStandardMaterial color="#584430" roughness={1} />
      </mesh>
      {/* arms reaching */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.1, 0.16, 0]} rotation={[0, 0, s * -0.5]}>
          <cylinderGeometry args={[0.02, 0.02, 0.34, 5]} />
          <meshStandardMaterial color="#4e3c28" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/** A bird lands on the fallen column, considers things, moves on. */
function Bird({ channel }: { channel: EventChannel }) {
  const perch: [number, number, number] = [2.6, 0.75, -5];
  const ref = useEventAnim(channel, (g, p, t) => {
    let y = perch[1];
    let x = perch[0];
    if (p < 0.15) {
      const q = easeInOut(p / 0.15);
      x = perch[0] - (1 - q) * 6;
      y = perch[1] + (1 - q) * 4;
    } else if (p > 0.85) {
      const q = easeInOut((p - 0.85) / 0.15);
      x = perch[0] + q * 7;
      y = perch[1] + q * 5;
    }
    g.position.set(x, y, perch[2]);
    const flying = p < 0.15 || p > 0.85;
    const flap = flying ? Math.sin(t * 14) * 0.8 : 0.15;
    g.children[0].rotation.z = flap;
    g.children[1].rotation.z = -flap;
    // perch hop + look around
    if (!flying) g.rotation.y = Math.sin(t * 0.9) * 0.8;
  });
  return (
    <group ref={ref} visible={false}>
      {[1, -1].map((s, i) => (
        <mesh key={i} position={[0, 0.02, s * 0.03]} rotation={[s * 0.15, 0, 0]}>
          <planeGeometry args={[0.16, 0.4]} />
          <meshStandardMaterial color="#b8433a" roughness={0.8} side={2} />
        </mesh>
      ))}
      <mesh scale={[1.5, 0.9, 0.9]}>
        <sphereGeometry args={[0.07, 9, 7]} />
        <meshStandardMaterial color="#c85a3a" roughness={0.9} />
      </mesh>
      <mesh position={[0.1, 0.07, 0]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshStandardMaterial color="#8a3c2e" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Snake pours itself across the path. In no hurry. Neither are you. */
function Snake({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    const headZ = 4.4 - easeInOut(p) * 4.6;
    g.children.forEach((seg, i) => {
      const z = headZ + i * 0.14;
      const x = -1.6 + Math.sin(t * 3.2 + i * 0.9) * 0.14;
      seg.position.set(x, jungleHeight(x, z) + 0.045, z);
    });
  });
  return (
    <group ref={ref} visible={false}>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} castShadow>
          <sphereGeometry args={[i === 0 ? 0.055 : 0.05 - i * 0.002, 7, 6]} />
          <meshStandardMaterial color={i % 2 ? "#4a5228" : "#3c451f"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/** A handful of leaves lets go of the canopy at once. */
function LeafFall({ channel }: { channel: EventChannel }) {
  const drops = Array.from({ length: 9 }, (_, i) => ({
    x: -4 + ((i * 47) % 80) / 10,
    z: -3 + ((i * 31) % 70) / 10,
    delay: (i % 4) * 0.12,
    sway: 1 + (i % 3) * 0.5,
  }));
  const ref = useEventAnim(channel, (g, p, t) => {
    g.children.forEach((leaf, i) => {
      const d = drops[i];
      const q = Math.max(0, Math.min(1, (p - d.delay) / (1 - d.delay)));
      leaf.position.set(d.x + Math.sin(t * d.sway + i) * 0.4, 5.5 - q * 5.3, d.z);
      leaf.rotation.set(t * d.sway, i, t * 0.7);
      leaf.visible = q > 0 && q < 1;
    });
  });
  return (
    <group ref={ref} visible={false}>
      {drops.map((_, i) => (
        <mesh key={i}>
          <planeGeometry args={[0.09, 0.13]} />
          <meshStandardMaterial color={i % 2 ? "#6a7a30" : "#8a7a2e"} roughness={1} side={2} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The windShake event has no meshes of its own — its channel is consumed
 * by Vegetation (canopy gusts) and JungleAudio (wind swell).
 */

export function CommonActors({ channels }: { channels: JungleChannels }) {
  return (
    <>
      <Butterfly channel={channels.butterfly} />
      <Monkey channel={channels.monkey} />
      <Bird channel={channels.bird} />
      <Snake channel={channels.snake} />
      <LeafFall channel={channels.leafFall} />
    </>
  );
}
