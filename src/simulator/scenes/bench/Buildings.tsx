import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, Color, MeshStandardMaterial, NearestFilter, RepeatWrapping } from "three";
import { useSimulatorStore } from "../../state/simulatorStore";
import { getDaylightFactor } from "../../systems/TimeSystem";

/** Window grid drawn once; doubles as the emissive map so windows glow at night. */
function makeWindowTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 64, 128);
  for (let y = 6; y < 122; y += 12) {
    for (let x = 5; x < 58; x += 10) {
      // Not every household is home.
      if (Math.random() < 0.55) {
        ctx.fillStyle = Math.random() < 0.8 ? "#c8b070" : "#8fa8b8";
        ctx.fillRect(x, y, 5, 7);
      }
    }
  }
  const tex = new CanvasTexture(canvas);
  tex.magFilter = NearestFilter;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  return tex;
}

const BUILDINGS: [number, number, number, number][] = [
  // [x, width, height, depth]
  [-42, 10, 16, 8],
  [-30, 8, 22, 9],
  [-19, 12, 13, 8],
  [-6, 9, 26, 10],
  [5, 11, 18, 8],
  [17, 8, 30, 9],
  [28, 13, 15, 8],
  [41, 9, 21, 9],
];

const BUILDINGS_Z = -62;

/**
 * The city beyond the park fence: fog-softened tower blocks whose windows
 * light up as daylight fades. One shared material; emissive intensity is
 * mutated per-frame (no re-renders).
 */
export function Buildings() {
  const material = useMemo(() => {
    const map = makeWindowTexture();
    return new MeshStandardMaterial({
      color: "#5c5c60",
      map,
      emissive: new Color("#e8c070"),
      emissiveMap: map,
      emissiveIntensity: 0,
      roughness: 0.95,
    });
  }, []);

  useFrame(() => {
    const daylight = getDaylightFactor(useSimulatorStore.getState().timeOfDay);
    material.emissiveIntensity = Math.max(0, 1 - daylight * 3) * 0.9;
  });

  return (
    <group position={[0, 0, BUILDINGS_Z]}>
      {BUILDINGS.map(([x, w, h, d], i) => (
        <mesh key={i} position={[x, h / 2 - 0.5, -(i % 3) * 6]} material={material}>
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}
      {/* Unlit filler row further back for skyline depth */}
      {BUILDINGS.map(([x, w, h], i) => (
        <mesh key={`b${i}`} position={[x + 6, (h * 0.8) / 2, -16]}>
          <boxGeometry args={[w * 1.2, h * 0.8, 8]} />
          <meshStandardMaterial color="#4c4e54" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}
