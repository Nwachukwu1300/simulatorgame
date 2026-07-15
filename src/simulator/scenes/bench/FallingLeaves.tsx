import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Color, Float32BufferAttribute, Points } from "three";
import { useSimulatorStore } from "../../state/simulatorStore";

const AREA = 36;
const HEIGHT = 9;
const LEAF_COLORS = ["#b8862e", "#a05a24", "#8a7a2e", "#b8742a"];

/**
 * Autumn leaves drifting down over the lawn, recycled forever — the same
 * recycling technique as the shared RainEffect, but slow and swaying.
 */
export function FallingLeaves() {
  const pointsRef = useRef<Points>(null);
  const graphics = useSimulatorStore((s) => s.graphics);
  const count = graphics === "High" ? 130 : 55;

  const { geometry, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 2); // fall speed, sway phase
    const c = new Color();
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * AREA;
      positions[i * 3 + 1] = Math.random() * HEIGHT;
      positions[i * 3 + 2] = (Math.random() - 0.5) * AREA;
      c.set(LEAF_COLORS[i % LEAF_COLORS.length]);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      seeds[i * 2] = 0.35 + Math.random() * 0.35;
      seeds[i * 2 + 1] = Math.random() * Math.PI * 2;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    return { geometry, seeds };
  }, [count]);

  useFrame(({ clock }, delta) => {
    const { paused, weather } = useSimulatorStore.getState();
    if (paused || !pointsRef.current) return;
    const windy = weather === "storm" ? 2.2 : weather === "rain" ? 1.4 : 1;
    const pos = pointsRef.current.geometry.attributes.position;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) - seeds[i * 2] * windy * delta;
      let x = pos.getX(i) + Math.sin(t * 1.3 + seeds[i * 2 + 1]) * 0.55 * windy * delta;
      if (y < 0.05) {
        y = HEIGHT * (0.7 + Math.random() * 0.3);
        x = (Math.random() - 0.5) * AREA;
      }
      if (x > AREA / 2) x = -AREA / 2;
      pos.setX(i, x);
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={0.1} vertexColors transparent opacity={0.9} sizeAttenuation />
    </points>
  );
}
