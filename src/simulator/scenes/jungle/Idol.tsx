import { useMemo } from "react";
import { CanvasTexture } from "three";
import { SimulatorObject } from "../../objects/SimulatorObject";

/** Weathered stone: grey speckle, water stains and hairline cracks. */
function makeStoneTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#7c7a70";
  ctx.fillRect(0, 0, 256, 256);
  // speckle
  for (let i = 0; i < 2600; i++) {
    const v = Math.random();
    ctx.fillStyle = v > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(20,22,18,0.09)";
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  // dark water stains running down
  for (let i = 0; i < 14; i++) {
    const x = Math.random() * 256;
    const w = 4 + Math.random() * 14;
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "rgba(40,44,36,0.22)");
    grad.addColorStop(1, "rgba(40,44,36,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, w, 256);
  }
  // cracks
  ctx.strokeStyle = "rgba(24,26,22,0.35)";
  for (let i = 0; i < 10; i++) {
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    let x = Math.random() * 256;
    let y = Math.random() * 100;
    ctx.moveTo(x, y);
    for (let s = 0; s < 6; s++) {
      x += Math.random() * 24 - 12;
      y += 14 + Math.random() * 18;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  return new CanvasTexture(canvas);
}

/** Moss clumps: flattened dark-green spheres pressed onto the stone. */
function Moss({ spots }: { spots: [number, number, number, number][] }) {
  return (
    <>
      {spots.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={[s, s * 0.45, s]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={i % 2 ? "#3c5230" : "#46603a"} roughness={1} />
        </mesh>
      ))}
    </>
  );
}

/**
 * The player. An idol carved before writing reached this valley. It has
 * outlasted its makers, their language, and their god. It will outlast
 * this session too.
 */
export function Idol() {
  const stone = useMemo(makeStoneTexture, []);
  const stoneMat = <meshStandardMaterial map={stone} roughness={0.95} />;
  const stoneDark = <meshStandardMaterial map={stone} color="#8a887e" roughness={0.95} />;

  return (
    <SimulatorObject position={[0, 0, 0]} rotation={[0, -0.22, 0.025]}>
      {/* Sunken plinth, corners lost to the earth */}
      <mesh position={[0, 0.12, 0]} rotation={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.32, 1.4]} />
        {stoneDark}
      </mesh>
      {/* Base block */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.95, 0.5, 0.85]} />
        {stoneMat}
      </mesh>
      {/* Torso, arms carved in relief at the sides */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.78, 0.62, 0.6]} />
        {stoneMat}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.44, 1.0, 0.08]} castShadow>
          <boxGeometry args={[0.12, 0.5, 0.28]} />
          {stoneDark}
        </mesh>
      ))}
      {/* Hands meeting over the belly */}
      <mesh position={[0, 0.82, 0.32]} castShadow>
        <boxGeometry args={[0.4, 0.14, 0.12]} />
        {stoneDark}
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <boxGeometry args={[0.58, 0.52, 0.52]} />
        {stoneMat}
      </mesh>
      {/* Brow ridge */}
      <mesh position={[0, 1.76, 0.24]} castShadow>
        <boxGeometry args={[0.5, 0.09, 0.1]} />
        {stoneDark}
      </mesh>
      {/* Recessed eyes — they see nothing. They see everything. */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.14, 1.66, 0.265]}>
          <boxGeometry args={[0.13, 0.07, 0.02]} />
          <meshStandardMaterial color="#26261f" roughness={1} />
        </mesh>
      ))}
      {/* Broad nose + solemn mouth */}
      <mesh position={[0, 1.56, 0.27]} castShadow>
        <boxGeometry args={[0.11, 0.16, 0.05]} />
        {stoneDark}
      </mesh>
      <mesh position={[0, 1.44, 0.265]}>
        <boxGeometry args={[0.24, 0.045, 0.02]} />
        <meshStandardMaterial color="#33332a" roughness={1} />
      </mesh>
      {/* Headdress slab, chipped on one side */}
      <mesh position={[0.02, 1.95, 0]} rotation={[0, 0, -0.03]} castShadow>
        <boxGeometry args={[0.72, 0.16, 0.62]} />
        {stoneDark}
      </mesh>
      {/* Moss claims the shaded faces and every horizontal ledge */}
      <Moss
        spots={[
          [0.3, 2.02, 0.1, 0.22],
          [-0.28, 2.0, -0.15, 0.18],
          [-0.4, 1.62, 0.1, 0.14],
          [0.36, 1.3, -0.2, 0.16],
          [-0.45, 0.95, 0.15, 0.15],
          [0.4, 0.72, 0.3, 0.14],
          [-0.55, 0.3, -0.4, 0.3],
          [0.6, 0.28, 0.35, 0.26],
          [0.1, 0.3, -0.6, 0.28],
        ]}
      />
      {/* Offerings long since fossilised into the ground */}
      <mesh position={[0, 0.02, 1.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 20]} />
        <meshStandardMaterial color="#3d3423" roughness={1} transparent opacity={0.6} />
      </mesh>
    </SimulatorObject>
  );
}
