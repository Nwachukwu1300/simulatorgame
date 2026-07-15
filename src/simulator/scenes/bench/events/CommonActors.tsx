import type { Group } from "three";
import { easeInOut, useEventAnim, type EventChannel } from "../../../systems/eventHelpers";
import { Figure, SeatedFigure, walk } from "../../../effects/npc";
import { dogBark } from "../../../engine/proceduralAudio";
import { parkHeight } from "../terrain";
import { COUPLE_BENCH } from "../ParkProps";
import type { BenchChannels } from "./benchEvents";

/** Jogger pounds down the path. Committed. */
function Jogger({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    const x = -15 + easeInOut(p) * 30;
    walk(g, x, parkHeight(x, 2.5), 2.5, t, Math.PI / 2, 9);
  });
  return (
    <group ref={ref} visible={false}>
      <Figure shirt="#b8433a" pants="#2c2c30" />
    </group>
  );
}

/** A dog and its human. The dog notices you. The human does not. */
function DogWalker({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    const x = -14 + easeInOut(p) * 28;
    g.position.set(x, parkHeight(x, 2), 2);
    const owner = g.children[0] as Group;
    const dog = g.children[1] as Group;
    owner.position.y = Math.abs(Math.sin(t * 5.2)) * 0.04;
    owner.rotation.z = Math.sin(t * 5.2) * 0.04;
    dog.position.set(0.9, Math.abs(Math.sin(t * 8)) * 0.05, -0.35);
    dog.rotation.y = Math.sin(t * 1.7) * 0.25; // sniffing around
    if (Math.random() < 0.0015) dogBark(0.1);
  });
  return (
    <group ref={ref} visible={false} rotation={[0, Math.PI / 2, 0]}>
      <group>
        <Figure shirt="#4a5a6a" pants="#5a5248" />
      </group>
      <group>
        {/* body */}
        <mesh position={[0, 0.28, 0]} scale={[1.7, 1, 1]} castShadow>
          <sphereGeometry args={[0.14, 10, 8]} />
          <meshStandardMaterial color="#7a5c3a" roughness={1} />
        </mesh>
        {/* head */}
        <mesh position={[0.26, 0.38, 0]} castShadow>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color="#6e5234" roughness={1} />
        </mesh>
        {/* legs */}
        {[
          [0.14, 0.06],
          [0.14, -0.06],
          [-0.14, 0.06],
          [-0.14, -0.06],
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.1, lz]}>
            <cylinderGeometry args={[0.02, 0.02, 0.2, 5]} />
            <meshStandardMaterial color="#6e5234" roughness={1} />
          </mesh>
        ))}
        {/* tail */}
        <mesh position={[-0.26, 0.36, 0]} rotation={[0, 0, -0.8]}>
          <cylinderGeometry args={[0.015, 0.03, 0.18, 5]} />
          <meshStandardMaterial color="#7a5c3a" roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

/** Cyclist. Gone before you can appreciate them. You have time. */
function Cyclist({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    const x = -16 + p * 32;
    g.position.set(x, parkHeight(x, 2.9), 2.9);
    g.rotation.z = Math.sin(t * 2.5) * 0.02;
    const wheels = g.children[0] as Group;
    (wheels.children[0] as Group).rotation.z = -x * 3;
    (wheels.children[1] as Group).rotation.z = -x * 3;
  });
  return (
    <group ref={ref} visible={false}>
      <group>
        {[0.42, -0.42].map((wx, i) => (
          <group key={i} position={[wx, 0.3, 0]}>
            <mesh>
              <torusGeometry args={[0.28, 0.03, 6, 18]} />
              <meshStandardMaterial color="#1e1e1e" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
      {/* frame */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.7, 0.035, 0.035]} />
        <meshStandardMaterial color="#3a6ea8" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* rider, leaning forward */}
      <group position={[0, 0.42, 0]} rotation={[0, Math.PI / 2, -0.35]} scale={0.9}>
        <Figure shirt="#d8a03a" pants="#2c2c30" />
      </group>
    </group>
  );
}

/** A couple takes the next bench. They talk quietly. You do not. */
function Couple({ channel }: { channel: EventChannel }) {
  const [bx, , bz] = COUPLE_BENCH;
  const ref = useEventAnim(channel, (g, p, t) => {
    g.position.set(0, 0, 0);
    const walkers = g.children[0] as Group;
    const seated = g.children[1] as Group;
    const walkIn = p < 0.1;
    const walkOut = p > 0.9;
    walkers.visible = walkIn || walkOut;
    seated.visible = !walkers.visible;
    if (walkIn) {
      const q = easeInOut(p / 0.1);
      const x = 15 - q * (15 - bx);
      const z = 2.6 + q * 0.9;
      walk(walkers, x, parkHeight(x, z), z, t, -Math.PI / 2);
    } else if (walkOut) {
      const q = easeInOut((p - 0.9) / 0.1);
      const x = bx + q * 10;
      const z = 3.5 - q * 0.9;
      walk(walkers, x, parkHeight(x, z), z, t, Math.PI / 2);
    } else {
      // The occasional nod. Conversation, presumably.
      (seated.children[0] as Group).rotation.x = Math.sin(t * 0.8) * 0.03;
      (seated.children[1] as Group).rotation.x = Math.cos(t * 0.6) * 0.03;
    }
  });
  return (
    <group ref={ref} visible={false}>
      <group>
        <group position={[0, 0, -0.3]}>
          <Figure shirt="#7a4a5a" pants="#4a4440" />
        </group>
        <group position={[0.1, 0, 0.3]}>
          <Figure shirt="#4a5a3a" pants="#5a5248" />
        </group>
      </group>
      <group position={[bx, 0.47, bz]} rotation={[0, Math.PI, 0]}>
        <group position={[-0.3, 0, 0]}>
          <SeatedFigure shirt="#7a4a5a" pants="#4a4440" />
        </group>
        <group position={[0.3, 0, 0]}>
          <SeatedFigure shirt="#4a5a3a" pants="#5a5248" />
        </group>
      </group>
    </group>
  );
}

/** A football escapes. A small human pursues it. Order is restored. */
function Football({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    const ballX = -12 + easeInOut(p) * 22;
    const ball = g.children[0] as Group;
    const kid = g.children[1] as Group;
    ball.position.set(ballX, parkHeight(ballX, 1.5) + 0.14, 1.5);
    ball.rotation.z = -ballX / 0.14;
    const kidX = ballX - 1.8;
    walk(kid, kidX, parkHeight(kidX, 1.6), 1.6, t, Math.PI / 2, 10);
  });
  return (
    <group ref={ref} visible={false}>
      <group>
        <mesh castShadow>
          <sphereGeometry args={[0.14, 12, 10]} />
          <meshStandardMaterial color="#e8e4dc" roughness={0.5} />
        </mesh>
      </group>
      <group scale={0.62}>
        <Figure shirt="#3a6ea8" pants="#4a4440" />
      </group>
    </group>
  );
}

/** Squirrel commits to a diagonal, pauses to judge you, moves on. */
function Squirrel({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    // Dash - pause - dash - pause - dash
    const seg = Math.min(0.999, p) * 5; // pauses on odd segments
    const q = (Math.floor(seg / 2) + easeInOut(Math.min(1, seg % 2))) / 3;
    const x = -6 + q * 11;
    const z = 0.4 - q * 0.6;
    const moving = seg % 2 < 1;
    g.position.set(x, parkHeight(x, z) + (moving ? Math.abs(Math.sin(t * 14)) * 0.1 : 0), z);
    g.rotation.y = moving ? Math.PI / 2 : Math.PI * 0.75 + Math.sin(t * 3) * 0.1;
  });
  return (
    <group ref={ref} visible={false}>
      <mesh position={[0, 0.07, 0]} scale={[1.5, 1, 1]} castShadow>
        <sphereGeometry args={[0.07, 9, 7]} />
        <meshStandardMaterial color="#8a5a34" roughness={1} />
      </mesh>
      <mesh position={[0.11, 0.12, 0]} castShadow>
        <sphereGeometry args={[0.045, 8, 6]} />
        <meshStandardMaterial color="#7e5230" roughness={1} />
      </mesh>
      {/* magnificent tail */}
      <mesh position={[-0.12, 0.13, 0]} rotation={[0, 0, 0.7]} scale={[0.6, 1.4, 0.6]} castShadow>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshStandardMaterial color="#96663c" roughness={1} />
      </mesh>
    </group>
  );
}

/** Pigeons arrive, audit the ground near your feet, depart unimpressed. */
function Pigeons({ channel }: { channel: EventChannel }) {
  const spots: [number, number][] = [
    [-1.2, 2.9],
    [-0.3, 3.2],
    [0.6, 2.7],
  ];
  const ref = useEventAnim(channel, (g, p, t) => {
    g.children.forEach((bird, i) => {
      const [x, z] = spots[i];
      const ground = parkHeight(x, z) + 0.07;
      let y: number;
      if (p < 0.12) y = ground + (1 - easeInOut(p / 0.12)) * 5;
      else if (p > 0.86) y = ground + easeInOut((p - 0.86) / 0.14) * 6;
      else y = ground;
      bird.position.set(x, y, z);
      const pecking = p >= 0.12 && p <= 0.86;
      bird.rotation.y = i * 2.1 + (pecking ? Math.sin(t * 0.9 + i) * 0.4 : 0);
      // Head-bob peck
      ((bird as Group).children[1] as Group).position.y =
        0.1 - (pecking && Math.sin(t * 6 + i * 2) > 0.55 ? 0.05 : 0);
    });
  });
  return (
    <group ref={ref} visible={false}>
      {spots.map((_, i) => (
        <group key={i}>
          <mesh scale={[1.4, 1, 1]} castShadow>
            <sphereGeometry args={[0.06, 9, 7]} />
            <meshStandardMaterial color={i === 1 ? "#8a8a90" : "#6e6e76"} roughness={1} />
          </mesh>
          <mesh position={[0.08, 0.1, 0]}>
            <sphereGeometry args={[0.032, 8, 6]} />
            <meshStandardMaterial color="#5a5a64" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function CommonActors({ channels }: { channels: BenchChannels }) {
  return (
    <>
      <Jogger channel={channels.jogger} />
      <DogWalker channel={channels.dog} />
      <Cyclist channel={channels.cyclist} />
      <Couple channel={channels.couple} />
      <Football channel={channels.football} />
      <Squirrel channel={channels.squirrel} />
      <Pigeons channel={channels.pigeons} />
    </>
  );
}
