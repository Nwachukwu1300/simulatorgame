import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  Points,
  Vector3,
} from "three";
import { Sky } from "@react-three/drei";
import { useSimulatorStore } from "../state/simulatorStore";
import { getDaylightFactor, getSunPosition } from "../systems/TimeSystem";

/** Soft cloud sprite drawn once to a canvas. */
function makeCloudTexture(): CanvasTexture {
  const w = 256;
  const h = 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  for (let i = 0; i < 14; i++) {
    const x = 40 + Math.random() * (w - 80);
    const y = 40 + Math.random() * (h - 80);
    const r = 22 + Math.random() * 30;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  return new CanvasTexture(canvas);
}

const CLOUD_COUNT = 10;

/**
 * AtmosphericSky — procedural sky dome that follows the sun position.
 * Uses Three.js Sky shader for realistic Rayleigh/Mie scattering.
 *
 * Sun position is calculated from TimeSystem and updated per-frame via
 * direct uniform access for smooth day/night transitions.
 */
function AtmosphericSky() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const skyRef = useRef<any>(null);
  const sunVec = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const { timeOfDay } = useSimulatorStore.getState();

    // Get sun position (normalized direction for sky shader)
    getSunPosition(timeOfDay, 1, sunVec);

    // Directly update the sky shader's sun position uniform
    const sky = skyRef.current;
    if (sky?.material?.uniforms?.sunPosition) {
      sky.material.uniforms.sunPosition.value.copy(sunVec);
    }
  });

  return (
    <Sky
      ref={skyRef}
      distance={450000}
      sunPosition={[0.5, 0.2, 0.8]}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
      rayleigh={0.5}
      turbidity={8}
    />
  );
}

/**
 * Drifting billboard clouds + a night-time star field + atmospheric sky.
 * Shared by every simulator (promoted from the Coconut scene in Stage 5).
 * Cloud opacity rises with cloudy/rain/storm weather; stars fade in at night.
 */
export function SkyLayer() {
  const texture = useMemo(makeCloudTexture, []);
  const cloudRefs = useRef<(Mesh | null)[]>([]);
  const starsRef = useRef<Points>(null);
  const group = useRef<Group>(null);
  const skyOpacity = useRef(1);

  const clouds = useMemo(
    () =>
      Array.from({ length: CLOUD_COUNT }, (_, i) => ({
        x: -140 + ((i * 53.7) % 280),
        y: 26 + ((i * 7.3) % 14),
        z: -40 - ((i * 23.9) % 120),
        w: 40 + ((i * 11.3) % 40),
        speed: 0.5 + ((i * 0.13) % 0.5),
      })),
    [],
  );

  const starGeometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions: number[] = [];
    for (let i = 0; i < 420; i++) {
      // Upper hemisphere dome
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.45;
      const r = 200;
      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) + 5,
        r * Math.sin(phi) * Math.sin(theta),
      );
    }
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    const { paused, timeOfDay, weather } = useSimulatorStore.getState();
    const daylight = getDaylightFactor(timeOfDay);

    const cover =
      weather === "storm" ? 1 : weather === "rain" ? 0.85 : weather === "cloudy" ? 0.6 : 0.3;
    const brightness = 0.25 + daylight * 0.75;

    cloudRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      if (!paused) {
        mesh.position.x += clouds[i].speed * delta;
        if (mesh.position.x > 160) mesh.position.x = -160;
      }
      const m = mesh.material as MeshBasicMaterial;
      m.opacity = cover * (0.4 + (i % 3) * 0.12);
      const grey = weather === "storm" ? 0.45 : weather === "rain" ? 0.65 : 1;
      m.color.setScalar(brightness * grey);
    });

    if (starsRef.current) {
      const m = starsRef.current.material as MeshBasicMaterial;
      m.opacity = Math.max(0, 1 - daylight * 3) * (weather === "clear" ? 0.9 : 0.25);
    }
  });

  return (
    <group ref={group}>
      {/* Procedural atmospheric sky */}
      <AtmosphericSky />

      {/* Billboard clouds */}
      {clouds.map((c, i) => (
        <mesh
          key={i}
          ref={(m) => (cloudRefs.current[i] = m)}
          position={[c.x, c.y, c.z]}
          rotation={[-0.15, 0, 0]}
        >
          <planeGeometry args={[c.w, c.w * 0.4]} />
          <meshBasicMaterial
            map={texture}
            transparent
            depthWrite={false}
            fog={false}
            side={2}
          />
        </mesh>
      ))}

      {/* Star field for night time */}
      <points ref={starsRef} geometry={starGeometry}>
        <pointsMaterial size={0.7} color="#dfe6f0" transparent opacity={0} fog={false} sizeAttenuation={false} />
      </points>
    </group>
  );
}
