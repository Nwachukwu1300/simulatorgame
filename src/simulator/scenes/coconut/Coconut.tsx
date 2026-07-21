import { Suspense, useMemo } from "react";
import { CanvasTexture, RepeatWrapping, LinearSRGBColorSpace, Vector2 } from "three";
import { useGLTF } from "@react-three/drei";
import { SimulatorObject } from "../../objects/SimulatorObject";
import { sandHeight } from "./terrain";
import { MODELS } from "../../utils/assetLoader";

/**
 * Procedural coconut husk albedo/diffuse map.
 * Creates natural brown color variation with fibrous texture.
 */
function makeHuskAlbedoMap(): CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Base coconut brown
  ctx.fillStyle = "#6d4a2b";
  ctx.fillRect(0, 0, size, size);

  // Add natural color variation (lighter and darker patches)
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 15 + Math.random() * 40;
    const isLighter = Math.random() > 0.5;
    const alpha = 0.1 + Math.random() * 0.15;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    if (isLighter) {
      grad.addColorStop(0, `rgba(140, 95, 60, ${alpha})`);
    } else {
      grad.addColorStop(0, `rgba(60, 35, 18, ${alpha})`);
    }
    grad.addColorStop(1, "rgba(109, 74, 43, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  // Add fibrous streaks (vertical direction like real coconut fibers)
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const length = 8 + Math.random() * 20;
    const shade = Math.random() > 0.5 ?
      `rgba(90, 60, 35, ${0.15 + Math.random() * 0.2})` :
      `rgba(50, 30, 15, ${0.15 + Math.random() * 0.2})`;

    ctx.strokeStyle = shade;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 3, y + length);
    ctx.stroke();
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(2, 1.5);
  return tex;
}

/**
 * Procedural normal map for coconut husk fibers.
 * Creates the illusion of depth for the fibrous texture.
 */
function makeHuskNormalMap(): CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Base flat normal (pointing up: RGB 128, 128, 255)
  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, size, size);

  // Add fiber normal perturbations
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const length = 6 + Math.random() * 15;
    const width = 0.8 + Math.random() * 2;

    // Slight left or right tilt for the fiber
    const tiltX = 128 + (Math.random() - 0.5) * 50;
    const tiltY = 128 + (Math.random() * 0.3 - 0.15) * 30;

    ctx.strokeStyle = `rgb(${tiltX}, ${tiltY}, 230)`;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 2, y + length);
    ctx.stroke();
  }

  // Add some larger bumps
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 2 + Math.random() * 5;
    const nx = 128 + (Math.random() - 0.5) * 40;
    const ny = 128 + (Math.random() - 0.5) * 40;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgb(${nx}, ${ny}, 255)`);
    grad.addColorStop(1, "rgba(128, 128, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(2, 1.5);
  tex.colorSpace = LinearSRGBColorSpace;
  return tex;
}

/**
 * Procedural roughness map - fibers are rougher, smooth spots less so.
 */
function makeHuskRoughnessMap(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Base high roughness
  ctx.fillStyle = "rgb(220, 220, 220)";
  ctx.fillRect(0, 0, size, size);

  // Add variation
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 3 + Math.random() * 10;
    const v = 160 + Math.random() * 95;

    ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(2, 1.5);
  return tex;
}

/**
 * 3D Model version of the coconut.
 * Loads a GLB model with full PBR textures.
 */
function CoconutModel() {
  const { scene } = useGLTF(MODELS.coconut);
  const groundY = sandHeight(0, 0);

  // Clone the scene to avoid mutations
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    // Enable shadows on all meshes
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return (
    <SimulatorObject position={[0, groundY + 0.15, 0]} rotation={[0.18, 0.7, -0.08]}>
      <primitive object={clonedScene} scale={0.3} />
      {/* Depression in the sand */}
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.4, 32]} />
        <meshStandardMaterial color="#a8916a" roughness={0.95} metalness={0} />
      </mesh>
    </SimulatorObject>
  );
}

/**
 * Procedural fallback coconut (used when 3D model is not available).
 */
function ProceduralCoconut() {
  const albedoMap = useMemo(makeHuskAlbedoMap, []);
  const normalMap = useMemo(makeHuskNormalMap, []);
  const roughnessMap = useMemo(makeHuskRoughnessMap, []);
  const normalScale = useMemo(() => new Vector2(0.8, 0.8), []);
  const groundY = sandHeight(0, 0);

  return (
    <SimulatorObject position={[0, groundY + 0.21, 0]} rotation={[0.18, 0.7, -0.08]}>
      {/* Husk - main coconut body */}
      <mesh castShadow receiveShadow scale={[1, 0.88, 0.94]}>
        <sphereGeometry args={[0.27, 48, 36]} />
        <meshPhysicalMaterial
          map={albedoMap}
          normalMap={normalMap}
          normalScale={normalScale}
          roughnessMap={roughnessMap}
          roughness={0.9}
          metalness={0}
          clearcoat={0.05}
          clearcoatRoughness={0.8}
          envMapIntensity={0.4}
        />
      </mesh>

      {/* Germination pores (the three "eyes" of the coconut) */}
      {(
        [
          [0.07, 0.2, 0.16],
          [-0.07, 0.2, 0.16],
          [0, 0.14, 0.22],
        ] as const
      ).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[0.028, 16, 12]} />
          <meshPhysicalMaterial
            color="#1e1208"
            roughness={0.85}
            metalness={0}
            clearcoat={0.1}
          />
        </mesh>
      ))}

      {/* Depression in the sand where it has always rested */}
      <mesh position={[0, -0.19, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.4, 32]} />
        <meshStandardMaterial
          color="#a8916a"
          roughness={0.95}
          metalness={0}
        />
      </mesh>
    </SimulatorObject>
  );
}

/**
 * The player. A coconut resting in the sand.
 * It does not move. It will never move.
 *
 * Tries to load a 3D model first, falls back to procedural if unavailable.
 */
export function Coconut() {
  return (
    <Suspense fallback={<ProceduralCoconut />}>
      <CoconutModel />
    </Suspense>
  );
}

// Import THREE for type checking
import * as THREE from "three";
