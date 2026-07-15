import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Float32BufferAttribute, PointLight, Points, PointsMaterial } from "three";
import { useSimulatorStore } from "../state/simulatorStore";
import { thunder } from "../engine/proceduralAudio";

const AREA = 45;
const HEIGHT = 22;

/**
 * Generic rain + storm effect, reusable by any simulator.
 * Renders when weather is "rain" or "storm"; storms add lightning flashes
 * (point light spike + procedural thunder). Mounted by the WeatherSystem.
 */
export function RainEffect() {
  const graphics = useSimulatorStore((s) => s.graphics);
  const count = graphics === "High" ? 1600 : 600;

  const pointsRef = useRef<Points>(null);
  const flashRef = useRef<PointLight>(null);
  const nextFlash = useRef(4 + Math.random() * 8);
  const flashEnergy = useRef(0);

  const { geometry, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const vels = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * AREA;
      positions[i * 3 + 1] = Math.random() * HEIGHT;
      positions[i * 3 + 2] = (Math.random() - 0.5) * AREA;
      vels[i] = 9 + Math.random() * 5;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return { geometry: geo, velocities: vels };
  }, [count]);

  useFrame((_, delta) => {
    const { paused, weather } = useSimulatorStore.getState();
    if (paused) return;

    const points = pointsRef.current;
    if (points) {
      const pos = points.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < count; i++) {
        arr[i * 3 + 1] -= velocities[i] * delta;
        if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] = HEIGHT;
      }
      pos.needsUpdate = true;
      (points.material as PointsMaterial).opacity = weather === "storm" ? 0.55 : 0.4;
    }

    // Lightning only during storms
    const flash = flashRef.current;
    if (!flash) return;
    if (weather === "storm") {
      nextFlash.current -= delta;
      if (nextFlash.current <= 0) {
        nextFlash.current = 5 + Math.random() * 12;
        flashEnergy.current = 1;
        thunder(0.7 + Math.random() * 1.5); // delayed rumble
      }
    }
    flashEnergy.current = Math.max(0, flashEnergy.current - delta * 4);
    flash.intensity = flashEnergy.current * 180;
  });

  return (
    <>
      <points ref={pointsRef} geometry={geometry} position={[0, 0, -4]}>
        <pointsMaterial color="#9fb4c4" size={0.05} transparent opacity={0.4} depthWrite={false} />
      </points>
      <pointLight ref={flashRef} position={[10, 18, -30]} color="#cfd8ff" intensity={0} distance={200} />
    </>
  );
}
