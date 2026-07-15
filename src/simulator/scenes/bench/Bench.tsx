import { useMemo } from "react";
import { CanvasTexture, RepeatWrapping } from "three";
import { SimulatorObject } from "../../objects/SimulatorObject";

/** Subtle wood-grain streaks drawn once to a canvas. */
function makeWoodTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#6b4f33";
  ctx.fillRect(0, 0, 256, 64);
  for (let i = 0; i < 220; i++) {
    const y = Math.random() * 64;
    const shade = Math.random();
    ctx.strokeStyle = shade > 0.5 ? "rgba(46,32,18,0.18)" : "rgba(140,108,72,0.15)";
    ctx.lineWidth = 0.6 + Math.random() * 1.4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(80, y + Math.random() * 4 - 2, 170, y + Math.random() * 4 - 2, 256, y);
    ctx.stroke();
  }
  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  return tex;
}

const SEAT_Y = 0.45;
const WIDTH = 1.7;

/** One cast-iron end frame: front leg, back leg, seat arm, backrest upright. */
function EndFrame({ side }: { side: number }) {
  const iron = <meshStandardMaterial color="#2b2926" roughness={0.6} metalness={0.55} />;
  const x = side * (WIDTH / 2 - 0.06);
  return (
    <group position={[x, 0, 0]}>
      {/* front + back legs */}
      <mesh position={[0, SEAT_Y / 2, 0.22]} castShadow>
        <boxGeometry args={[0.05, SEAT_Y, 0.06]} />
        {iron}
      </mesh>
      <mesh position={[0, SEAT_Y / 2, -0.2]} castShadow>
        <boxGeometry args={[0.05, SEAT_Y, 0.06]} />
        {iron}
      </mesh>
      {/* seat-level arm connecting the legs */}
      <mesh position={[0, SEAT_Y, 0.01]} castShadow>
        <boxGeometry args={[0.05, 0.06, 0.52]} />
        {iron}
      </mesh>
      {/* backrest upright, tilted back */}
      <mesh position={[0, SEAT_Y + 0.28, -0.26]} rotation={[0.22, 0, 0]} castShadow>
        <boxGeometry args={[0.05, 0.56, 0.06]} />
        {iron}
      </mesh>
    </group>
  );
}

/**
 * Classic slatted park bench: wooden slats on cast-iron end frames.
 * Faces +z. Reused for the player object and the background benches.
 */
export function ParkBench({
  position = [0, 0, 0],
  rotationY = 0,
  weathered = false,
}: {
  position?: [number, number, number];
  rotationY?: number;
  weathered?: boolean;
}) {
  const wood = useMemo(makeWoodTexture, []);
  const woodColor = weathered ? "#8a7f70" : "#8a6a48";

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <EndFrame side={-1} />
      <EndFrame side={1} />
      {/* Seat slats */}
      {[0.18, 0.06, -0.06, -0.18].map((z) => (
        <mesh key={`s${z}`} position={[0, SEAT_Y + 0.02, z]} castShadow receiveShadow>
          <boxGeometry args={[WIDTH, 0.035, 0.1]} />
          <meshStandardMaterial map={wood} color={woodColor} roughness={0.9} />
        </mesh>
      ))}
      {/* Back slats, following the upright tilt */}
      {[0.62, 0.78, 0.94].map((y, i) => (
        <mesh
          key={`b${i}`}
          position={[0, y, -0.295 - (y - SEAT_Y) * 0.222]}
          rotation={[0.22, 0, 0]}
          castShadow
        >
          <boxGeometry args={[WIDTH, 0.11, 0.035]} />
          <meshStandardMaterial map={wood} color={woodColor} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The player. A bench. It has held this position for four years and sees
 * no reason to stop now.
 */
export function Bench() {
  return (
    <SimulatorObject position={[0, 0, 0]}>
      <ParkBench />
      {/* Small brass dedication plaque — every serious bench has one. */}
      <mesh position={[0, 0.79, -0.328]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[0.28, 0.07, 0.045]} />
        <meshStandardMaterial color="#9a7d3a" roughness={0.35} metalness={0.8} />
      </mesh>
      {/* Worn ground patch where a thousand feet have rested */}
      <mesh position={[0, 0.012, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 20]} />
        <meshStandardMaterial color="#6e6448" roughness={1} transparent opacity={0.55} />
      </mesh>
    </SimulatorObject>
  );
}
