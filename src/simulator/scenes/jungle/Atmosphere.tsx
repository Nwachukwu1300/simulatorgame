import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Fog,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
} from "three";
import { useSimulatorStore } from "../../state/simulatorStore";
import { getDaylightFactor } from "../../systems/TimeSystem";

function makeSoftTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new CanvasTexture(canvas);
}

const MIST: [number, number, number, number][] = [
  // [x, z, width, drift speed]
  [-6, -4, 9, 0.14],
  [4, -7, 11, 0.1],
  [-2, 4.5, 8, 0.12],
  [8, 1, 9, 0.09],
  [-10, 2, 10, 0.11],
  [1, -11, 13, 0.08],
];

const RAYS: [number, number, number][] = [
  // [x, z, tilt]
  [-1.6, -1.5, 0.28],
  [1.8, -3, 0.34],
  [-4, 0.5, 0.3],
  [3.6, 0.8, 0.26],
];

/**
 * Everything in the air: ground mist (thickens in fog weather and around
 * dawn), sun shafts through the canopy (daylight + fair weather), and
 * fireflies once the light has gone. Also breathes the scene fog in and
 * out with the weather — dense fog pulls the horizon right into the trees.
 */
export function Atmosphere() {
  const texture = useMemo(makeSoftTexture, []);
  const scene = useThree((s) => s.scene);
  const mistRefs = useRef<(Mesh | null)[]>([]);
  const raysRef = useRef<(Mesh | null)[]>([]);
  const firefliesRef = useRef<Points>(null);
  const fogNear = useRef(12);
  const fogFar = useRef(110);

  const fireflyGeometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions: number[] = [];
    for (let i = 0; i < 60; i++) {
      positions.push((Math.random() - 0.5) * 16, 0.4 + Math.random() * 1.6, (Math.random() - 0.5) * 14);
    }
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geo;
  }, []);
  const fireflySeeds = useMemo(
    () => Array.from({ length: 60 }, () => Math.random() * Math.PI * 2),
    [],
  );

  useFrame(({ clock }, delta) => {
    const { paused, timeOfDay, weather } = useSimulatorStore.getState();
    const daylight = getDaylightFactor(timeOfDay);
    const t = clock.elapsedTime;

    // Morning mist boost between ~05:00 and ~09:00
    const morning = Math.max(0, 1 - Math.abs(timeOfDay - 7) / 2);
    const foggy = weather === "fog" ? 1 : 0;
    const mistStrength = 0.1 + foggy * 0.4 + morning * 0.2;

    mistRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      if (!paused) {
        mesh.position.x += MIST[i][3] * delta;
        if (mesh.position.x > 18) mesh.position.x = -18;
      }
      (mesh.material as MeshBasicMaterial).opacity = mistStrength * (0.5 + (i % 3) * 0.18);
    });

    // Sun shafts: daylight, killed by bad weather, shimmer slowly
    const shaft =
      daylight *
      (weather === "clear" ? 1 : weather === "cloudy" ? 0.25 : 0) *
      0.12;
    raysRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      (mesh.material as MeshBasicMaterial).opacity = shaft * (0.7 + Math.sin(t * 0.4 + i * 1.7) * 0.3);
    });

    // Fireflies: night, fair weather, drifting on per-point sine paths
    if (firefliesRef.current) {
      const night = Math.max(0, 1 - daylight * 4) * (weather === "rain" || weather === "storm" ? 0.15 : 1);
      (firefliesRef.current.material as PointsMaterial).opacity = night * (0.55 + Math.sin(t * 2.3) * 0.25);
      if (!paused && night > 0.01) {
        const pos = firefliesRef.current.geometry.attributes.position;
        for (let i = 0; i < 60; i++) {
          const s = fireflySeeds[i];
          pos.setX(i, pos.getX(i) + Math.sin(t * 0.6 + s) * 0.25 * delta);
          pos.setY(i, pos.getY(i) + Math.cos(t * 0.8 + s * 2) * 0.15 * delta);
          pos.setZ(i, pos.getZ(i) + Math.cos(t * 0.5 + s) * 0.2 * delta);
        }
        pos.needsUpdate = true;
      }
    }

    // Breathe the scene fog with the weather
    const targetNear = weather === "fog" ? 5 : 12;
    const targetFar = weather === "fog" ? 42 : weather === "storm" ? 75 : 110;
    const ease = Math.min(1, delta * 0.4);
    fogNear.current += (targetNear - fogNear.current) * ease;
    fogFar.current += (targetFar - fogFar.current) * ease;
    if (scene.fog instanceof Fog) {
      scene.fog.near = fogNear.current;
      scene.fog.far = fogFar.current;
    }
  });

  return (
    <>
      {MIST.map(([x, z, w], i) => (
        <mesh key={i} ref={(m) => (mistRefs.current[i] = m)} position={[x, 1.1, z]} rotation={[-0.1, 0, 0]}>
          <planeGeometry args={[w, w * 0.32]} />
          <meshBasicMaterial map={texture} color="#c3cabb" transparent opacity={0} depthWrite={false} side={2} />
        </mesh>
      ))}
      {RAYS.map(([x, z, tilt], i) => (
        <mesh key={`r${i}`} ref={(m) => (raysRef.current[i] = m)} position={[x, 4.4, z]} rotation={[tilt, 0.5 + i, 0]}>
          <planeGeometry args={[0.9, 8.5]} />
          <meshBasicMaterial
            map={texture}
            color="#fff3d0"
            transparent
            opacity={0}
            depthWrite={false}
            blending={AdditiveBlending}
            fog={false}
            side={2}
          />
        </mesh>
      ))}
      <points ref={firefliesRef} geometry={fireflyGeometry}>
        <pointsMaterial
          size={0.055}
          color="#d8f2a0"
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </>
  );
}
