import { useMemo } from "react";
import { CanvasTexture, type Mesh, type MeshStandardMaterial } from "three";
import { sandHeight } from "../terrain";
import { easeInOut, useEventAnim, type EventChannel } from "./helpers";
import type { CoconutChannels } from "./coconutEvents";

/** Crab scuttles sideways across the beach in front of the coconut. */
function Crab({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    const x = -7 + easeInOut(p) * 14;
    g.position.set(x, sandHeight(x, 1.6) + 0.07 + Math.abs(Math.sin(t * 13)) * 0.02, 1.6);
    g.rotation.y = Math.sin(t * 13) * 0.08;
  });
  return (
    <group ref={ref} visible={false}>
      <mesh castShadow scale={[1.3, 0.55, 1]}>
        <sphereGeometry args={[0.09, 12, 8]} />
        <meshStandardMaterial color="#b0502e" roughness={0.7} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.13, 0.02, 0.06]} castShadow>
          <sphereGeometry args={[0.035, 8, 6]} />
          <meshStandardMaterial color="#c2603a" roughness={0.7} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh
          key={i}
          position={[(i % 3) * 0.07 - 0.07, -0.03, i < 3 ? 0.08 : -0.08]}
          rotation={[i < 3 ? 0.6 : -0.6, 0, 0]}
        >
          <cylinderGeometry args={[0.008, 0.008, 0.08, 4]} />
          <meshStandardMaterial color="#8a3c20" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/** Seagull crosses the sky with flapping wings. */
function Seagull({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p, t) => {
    g.position.set(-24 + p * 48, 8.5 + Math.sin(p * Math.PI * 2) * 0.8, -9);
    const flap = Math.sin(t * 9) * 0.55;
    g.children[0].rotation.z = flap;
    g.children[1].rotation.z = -flap;
  });
  return (
    <group ref={ref} visible={false}>
      {[1, -1].map((s, i) => (
        <mesh key={i} position={[0, 0, s * 0.02]} rotation={[s * 0.1, 0, 0]}>
          <planeGeometry args={[0.22, 0.75]} />
          <meshStandardMaterial color="#e8e8e4" roughness={0.8} side={2} />
        </mesh>
      ))}
      <mesh scale={[1.6, 0.8, 0.8]}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshStandardMaterial color="#dcdcd6" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** A modest wave of foam pushes up the sand toward the coconut, then recedes. */
function ShoreWave({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p) => {
    const advance = Math.sin(p * Math.PI);
    g.position.set(0, 0.05 + advance * 0.03, -3.2 + advance * 3.4);
    const mesh = g.children[0] as Mesh;
    (mesh.material as MeshStandardMaterial).opacity = 0.28 + advance * 0.3;
  });
  return (
    <group ref={ref} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 2.6, 8, 1]} />
        <meshStandardMaterial color="#e9f4f2" transparent opacity={0.4} roughness={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Fish leaps out of the ocean in an arc. */
function Fish({ channel }: { channel: EventChannel }) {
  const ref = useEventAnim(channel, (g, p) => {
    g.position.set(-4 + p * 3.5, Math.sin(p * Math.PI) * 1.5 - 0.25, -9);
    g.rotation.z = 1.1 - p * 2.2;
  });
  return (
    <group ref={ref} visible={false}>
      <mesh scale={[1, 2.4, 1]}>
        <coneGeometry args={[0.09, 0.3, 8]} />
        <meshStandardMaterial color="#9fb6bd" roughness={0.25} metalness={0.6} />
      </mesh>
    </group>
  );
}

/** A cousin drops from a nearby palm, bounces once, settles. */
function FallingCoconut({ channel }: { channel: EventChannel }) {
  const drop: [number, number, number] = [-3.5, 0, 3.6];
  const ground = sandHeight(drop[0], drop[2]) + 0.14;
  const ref = useEventAnim(channel, (g, p) => {
    const fall = Math.min(1, p * 5);
    let y = 4.9 - (4.9 - ground) * fall * fall;
    if (fall >= 1) {
      const b = (p - 0.2) * 10;
      y = ground + Math.abs(Math.sin(b * 3)) * 0.35 * Math.exp(-b * 1.6);
    }
    g.position.set(drop[0], y, drop[2]);
    g.rotation.x = p * 4;
  });
  return (
    <group ref={ref} visible={false}>
      <mesh castShadow scale={[1, 0.9, 0.95]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color="#5e4526" roughness={1} />
      </mesh>
    </group>
  );
}

function makeBallTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const colors = ["#e8e4dc", "#b8433a", "#e8e4dc", "#3a6ea8", "#e8e4dc", "#d8a03a"];
  colors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect((i * 128) / 6, 0, 128 / 6 + 1, 64);
  });
  return new CanvasTexture(canvas);
}

/** Somebody's beach ball rolls through. Nobody comes for it. */
function BeachBall({ channel }: { channel: EventChannel }) {
  const map = useMemo(makeBallTexture, []);
  const r = 0.32;
  const ref = useEventAnim(channel, (g, p) => {
    const x = -9 + easeInOut(p) * 18;
    g.position.set(x, sandHeight(x, 2.3) + r, 2.3);
    g.rotation.z = -x / r;
  });
  return (
    <group ref={ref} visible={false}>
      <mesh castShadow>
        <sphereGeometry args={[r, 20, 14]} />
        <meshStandardMaterial map={map} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function CommonActors({ channels }: { channels: CoconutChannels }) {
  return (
    <>
      <Crab channel={channels.crab} />
      <Seagull channel={channels.seagull} />
      <ShoreWave channel={channels.shoreWave} />
      <Fish channel={channels.fish} />
      <FallingCoconut channel={channels.fallingCoconut} />
      <BeachBall channel={channels.beachBall} />
    </>
  );
}
