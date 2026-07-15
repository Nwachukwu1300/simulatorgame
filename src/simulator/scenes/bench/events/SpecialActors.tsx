import { useRef } from "react";
import type { Group, PointLight } from "three";
import { easeInOut, useEventAnim, type EventChannel } from "../../../systems/eventHelpers";
import { Figure, walk } from "../../../effects/npc";
import { vanJingle } from "../../../engine/proceduralAudio";
import { parkHeight } from "../terrain";
import type { BenchChannels } from "./benchEvents";

/** The van takes the service road behind the lawn. The jingle carries. */
function IceCreamVan({ channel }: { channel: EventChannel }) {
  const lastJingle = useRef(-1);
  const ref = useEventAnim(channel, (g, p, t) => {
    if (p < lastJingle.current) lastJingle.current = -1; // new run
    g.position.set(-34 + p * 68, 0.42, -24);
    g.rotation.z = Math.sin(t * 7) * 0.008;
    for (const threshold of [0.02, 0.4, 0.75]) {
      if (p >= threshold && lastJingle.current < threshold) {
        lastJingle.current = threshold;
        vanJingle(0.045);
      }
    }
  });
  return (
    <group ref={ref} visible={false}>
      {/* box body */}
      <mesh castShadow>
        <boxGeometry args={[2.4, 1.5, 1.1]} />
        <meshStandardMaterial color="#efe8dc" roughness={0.5} />
      </mesh>
      {/* cab */}
      <mesh position={[1.5, -0.2, 0]} castShadow>
        <boxGeometry args={[0.9, 1.1, 1.05]} />
        <meshStandardMaterial color="#efe8dc" roughness={0.5} />
      </mesh>
      {/* pink livery stripe */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[2.42, 0.4, 1.12]} />
        <meshStandardMaterial color="#d87a9a" roughness={0.5} />
      </mesh>
      {/* giant cone on the roof, as legally required */}
      <group position={[0, 1.15, 0]}>
        <mesh rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.18, 0.5, 9]} />
          <meshStandardMaterial color="#c9a06a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <sphereGeometry args={[0.2, 10, 8]} />
          <meshStandardMaterial color="#f2e9e0" roughness={0.8} />
        </mesh>
      </group>
      {[1.4, -0.9].map((wx) =>
        [0.5, -0.5].map((wz) => (
          <mesh key={`${wx}${wz}`} position={[wx, -0.75, wz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.15, 10]} />
            <meshStandardMaterial color="#1e1e1e" roughness={0.9} />
          </mesh>
        )),
      )}
    </group>
  );
}

/** Municipal lawn maintenance, in three careful passes. */
function Groundskeeper({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    const pass = Math.min(2, Math.floor(p * 3));
    const q = easeInOut(Math.min(1, (p * 3) % 1));
    const dir = pass % 2 === 0 ? 1 : -1;
    const x = dir > 0 ? -11 + q * 22 : 11 - q * 22;
    const z = -5 - pass * 1.1;
    walk(g, x, parkHeight(x, z), z, t, (dir * Math.PI) / 2, 4);
  });
  return (
    <group ref={ref} visible={false}>
      <Figure shirt="#c8742a" pants="#3c4a3a" />
      {/* push mower ahead of the figure */}
      <group position={[0, 0, 0.55]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.42, 0.2, 0.5]} />
          <meshStandardMaterial color="#3a5a38" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.4, -0.3]} rotation={[0.7, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.7, 5]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/** A busker sets up across the path. The acoustics here are honest. */
function Musician({ channel }: { channel: EventChannel }) {
  const spot: [number, number] = [-4.5, 3.7];
  const ref = useEventAnim(channel, (g, p, t) => {
    let x = spot[0];
    const walkIn = p < 0.08;
    const walkOut = p > 0.92;
    if (walkIn) x = spot[0] - (1 - easeInOut(p / 0.08)) * 9;
    if (walkOut) x = spot[0] - easeInOut((p - 0.92) / 0.08) * 9;
    const moving = walkIn || walkOut;
    walk(g, x, parkHeight(x, spot[1]), spot[1], moving ? t : 0, moving ? Math.PI / 2 : 0);
    if (!moving) g.rotation.z = Math.sin(t * 1.8) * 0.05; // playing sway
    (g.children[2] as Group).visible = !moving; // guitar case only while set up
  });
  return (
    <group ref={ref} visible={false}>
      <Figure shirt="#5a4a6a" pants="#3c3c40" />
      {/* guitar */}
      <group position={[0, 0.95, 0.2]} rotation={[0, 0, -0.5]}>
        <mesh scale={[1, 1.4, 0.5]} castShadow>
          <sphereGeometry args={[0.14, 10, 8]} />
          <meshStandardMaterial color="#7a4a24" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.04, 0.36, 0.03]} />
          <meshStandardMaterial color="#4a3018" roughness={0.7} />
        </mesh>
      </group>
      {/* open case, optimistic */}
      <mesh position={[0.5, 0.03, 0.4]} visible={false}>
        <boxGeometry args={[0.5, 0.06, 0.22]} />
        <meshStandardMaterial color="#2c2620" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Someone photographs the bench. It has a certain presence. */
function Photographer({ channel }: { channel: EventChannel }) {
  const flashRef = useRef<PointLight>(null);
  const ref = useEventAnim(channel, (g, p, t) => {
    let x: number;
    if (p < 0.35) x = -11 + easeInOut(p / 0.35) * 9;
    else if (p < 0.65) x = -2;
    else x = -2 - easeInOut((p - 0.65) / 0.35) * 9;
    const moving = p < 0.35 || p > 0.65;
    walk(g, x, parkHeight(x, 2.6), 2.6, moving ? t : 0, moving ? Math.PI / 2 : Math.PI * 1.1);
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

/** RARE: a wedding party poses by the flower bed. You are in the shots. */
function Wedding({ channel }: { channel: EventChannel }) {
  const flashRef = useRef<PointLight>(null);
  const ref = useEventAnim(channel, (g, p, t) => {
    const q = p < 0.15 ? easeInOut(p / 0.15) : p > 0.85 ? 1 - easeInOut((p - 0.85) / 0.15) : 1;
    const baseX = -14 + q * 11.5; // group walks in together, then out
    g.position.set(baseX, 0, 1);
    const posing = p >= 0.15 && p <= 0.85;
    g.children.forEach((child, i) => {
      child.position.y = posing ? 0 : Math.abs(Math.sin(t * 5 + i)) * 0.04;
    });
    if (flashRef.current) {
      const blink = posing && Math.sin(p * 260) > 0.92;
      flashRef.current.intensity = blink ? 16 : 0;
    }
  });
  return (
    <group ref={ref} visible={false}>
      {/* bride */}
      <group>
        <Figure shirt="#efeae2" pants="#efeae2" />
        <mesh position={[0, 0.35, 0]}>
          <coneGeometry args={[0.3, 0.72, 10]} />
          <meshStandardMaterial color="#efeae2" roughness={0.9} />
        </mesh>
      </group>
      {/* groom */}
      <group position={[0.55, 0, 0.1]}>
        <Figure shirt="#22242a" pants="#22242a" />
      </group>
      {/* their photographer, kneeling distance away */}
      <group position={[0.3, 0, 2.2]} rotation={[0, Math.PI, 0]} scale={[1, 0.82, 1]}>
        <Figure shirt="#4a4a4e" pants="#3c3c38" />
        <mesh position={[0, 1.3, 0.16]}>
          <boxGeometry args={[0.12, 0.08, 0.06]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.4} />
        </mesh>
        <pointLight ref={flashRef} position={[0, 1.3, 0.3]} intensity={0} distance={9} color="#eef2ff" />
      </group>
    </group>
  );
}

/** RARE: the marathon route apparently includes your path. All of it. */
function Marathon({ channel }: { channel: EventChannel }) {
  const runners: [number, number, string][] = [
    [0, 2.2, "#b8433a"],
    [-1.1, 2.7, "#3a6ea8"],
    [-2.3, 2.1, "#d8a03a"],
    [-3.1, 2.8, "#4a7c45"],
    [-4.6, 2.4, "#8a5c9a"],
    [-5.4, 2.9, "#c87a3a"],
  ];
  const ref = useEventAnim(channel, (g, p, t) => {
    const lead = -18 + p * 40;
    g.children.forEach((runner, i) => {
      const [dx, z] = runners[i];
      const x = lead + dx;
      walk(runner as Group, x, parkHeight(x, z), z, t + i * 0.7, Math.PI / 2, 8.5);
    });
  });
  return (
    <group ref={ref} visible={false}>
      {runners.map(([, , shirt], i) => (
        <group key={i}>
          <Figure shirt={shirt} pants="#2c2c30" />
          {/* race bib */}
          <mesh position={[0, 1.05, 0.17]}>
            <planeGeometry args={[0.16, 0.12]} />
            <meshStandardMaterial color="#f0f0ea" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** RARE: six strangers converge and dance in unison. No music plays. */
function FlashMob({ channel }: { channel: EventChannel }) {
  const spots: [number, number, string][] = [
    [-1.2, 1.2, "#b8433a"],
    [0.2, 1.6, "#3a6ea8"],
    [1.6, 1.1, "#d8a03a"],
    [-0.6, 2.6, "#4a7c45"],
    [0.9, 2.8, "#8a5c9a"],
    [2.3, 2.4, "#5a6a78"],
  ];
  const ref = useEventAnim(channel, (g, p, t) => {
    g.children.forEach((dancer, i) => {
      const [sx, sz] = spots[i];
      const d = dancer as Group;
      const angle = (i / 6) * Math.PI * 2;
      if (p < 0.2) {
        // converge from all directions
        const q = easeInOut(p / 0.2);
        const x = sx + Math.cos(angle) * 14 * (1 - q);
        const z = sz + Math.sin(angle) * 10 * (1 - q);
        walk(d, x, parkHeight(x, z), z, t, Math.atan2(sx - x, sz - z) || 0);
      } else if (p < 0.8) {
        // THE ROUTINE. perfectly synchronized.
        const beat = t * 4.4;
        d.position.set(sx, parkHeight(sx, sz) + Math.max(0, Math.sin(beat)) * 0.16, sz);
        d.rotation.set(0, Math.sin(beat / 2) * 0.9, Math.cos(beat) * 0.12);
      } else {
        // scatter as if nothing happened
        const q = easeInOut((p - 0.8) / 0.2);
        const x = sx + Math.cos(angle) * 14 * q;
        const z = sz + Math.sin(angle) * 10 * q;
        walk(d, x, parkHeight(x, z), z, t, Math.atan2(Math.cos(angle), Math.sin(angle)), 7);
      }
    });
  });
  return (
    <group ref={ref} visible={false}>
      {spots.map(([, , shirt], i) => (
        <group key={i}>
          <Figure shirt={shirt} pants="#2c2c30" />
        </group>
      ))}
    </group>
  );
}

/** RARE: a film crew shoots a scene. The bench does not sign a release. */
function MovieCrew({ channel }: { channel: EventChannel }) {
  const lightRef = useRef<PointLight>(null);
  const ref = useEventAnim(channel, (g, p, t) => {
    const q = p < 0.1 ? easeInOut(p / 0.1) : p > 0.9 ? 1 - easeInOut((p - 0.9) / 0.1) : 1;
    g.scale.setScalar(Math.max(0.001, q));
    g.position.set(-3.2, 0, 3.4);
    const filming = p >= 0.1 && p <= 0.9;
    const rig = g.children[0] as Group;
    rig.rotation.y = filming ? Math.sin(t * 0.25) * 0.2 : 0; // slow pan across the bench
    const boom = g.children[2] as Group;
    boom.rotation.z = filming ? 0.35 + Math.sin(t * 0.5) * 0.04 : 0.35;
    if (lightRef.current) {
      // recording tally blinks
      lightRef.current.intensity = filming && Math.sin(t * 3) > 0 ? 0.8 : 0;
    }
  });
  return (
    <group ref={ref} visible={false}>
      {/* camera on tripod, aimed at you */}
      <group rotation={[0, Math.PI * 0.9, 0]}>
        {[-0.35, 0, 0.35].map((lx, i) => (
          <mesh key={i} position={[lx * 0.6, 0.55, Math.abs(lx) - 0.18]} rotation={[lx === 0 ? -0.3 : 0.15, 0, lx * 0.85]}>
            <cylinderGeometry args={[0.02, 0.02, 1.15, 5]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.34, 0.22, 0.5]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.2, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 0.16, 10]} />
          <meshStandardMaterial color="#101014" roughness={0.3} />
        </mesh>
        <pointLight ref={lightRef} position={[0, 1.36, 0]} intensity={0} distance={2} color="#ff3020" />
      </group>
      {/* camera operator */}
      <group position={[0.35, 0, -0.5]}>
        <Figure shirt="#3c3c40" pants="#2c2c30" />
      </group>
      {/* boom operator, arms conceptually raised */}
      <group position={[-1.3, 0, 0.4]}>
        <Figure shirt="#4a4a4e" pants="#2c2c30" />
        <mesh position={[0.5, 1.9, -0.4]} rotation={[0, 0, 0.35]}>
          <cylinderGeometry args={[0.02, 0.02, 2.2, 5]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.6} />
        </mesh>
      </group>
      {/* director's chair + occupant with strong opinions */}
      <group position={[-2.2, 0, 1.2]}>
        <mesh position={[0, 0.32, 0]} castShadow>
          <boxGeometry args={[0.45, 0.05, 0.4]} />
          <meshStandardMaterial color="#7a2a28" roughness={0.9} />
        </mesh>
        {[-0.2, 0.2].map((cx) => (
          <mesh key={cx} position={[cx, 0.16, 0]}>
            <boxGeometry args={[0.04, 0.32, 0.34]} />
            <meshStandardMaterial color="#3a3026" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** RARE: a banana runs past. The park does not acknowledge it. */
function BananaRunner({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    const x = -16 + p * 32;
    g.position.set(x, parkHeight(x, 2.3) + Math.abs(Math.sin(t * 15)) * 0.1, 2.3);
    g.rotation.set(0.2, Math.PI / 2, Math.sin(t * 15) * 0.1);
  });
  return (
    <group ref={ref} visible={false}>
      <group scale={[1, 1.15, 1]}>
        <Figure shirt="#e8c83a" pants="#e8c83a" skin="#e8c83a" />
      </group>
      {/* banana tip */}
      <mesh position={[0, 1.95, -0.06]} rotation={[0.5, 0, 0]}>
        <coneGeometry args={[0.09, 0.5, 8]} />
        <meshStandardMaterial color="#d8b52e" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function SpecialActors({ channels }: { channels: BenchChannels }) {
  return (
    <>
      <IceCreamVan channel={channels.iceCreamVan} />
      <Groundskeeper channel={channels.groundskeeper} />
      <Musician channel={channels.musician} />
      <Photographer channel={channels.photographer} />
      <Wedding channel={channels.wedding} />
      <Marathon channel={channels.marathon} />
      <FlashMob channel={channels.flashMob} />
      <MovieCrew channel={channels.movieCrew} />
      <BananaRunner channel={channels.bananaRunner} />
    </>
  );
}
