import { Suspense, useMemo } from "react";
import {
  CanvasTexture,
  Color,
  LinearSRGBColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  Vector2,
} from "three";
import { useTexture } from "@react-three/drei";
import { makeTerrainGeometry } from "../../effects/terrainGeometry";
import { jungleHeight, onDirtPath } from "./terrain";
import { TEXTURES } from "../../utils/assetLoader";

const EARTH = new Color("#43371f");
const LITTER = new Color("#5c4826");
const MOSS = new Color("#3c5230");
const MOSS_DEEP = new Color("#2e4226");
const DIRT = new Color("#6b5638");
const DIRT_DARK = new Color("#57452c");

/**
 * Procedural jungle floor normal map for detail.
 * Creates subtle organic variations like roots and debris.
 */
function makeJungleNormalMap(): CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Base flat normal
  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, size, size);

  // Add organic bumps (leaves, twigs, roots)
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 1 + Math.random() * 4;
    const nx = 128 + (Math.random() - 0.5) * 50;
    const ny = 128 + (Math.random() - 0.5) * 50;
    const nz = 200 + Math.random() * 55;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgb(${nx}, ${ny}, ${nz})`);
    grad.addColorStop(1, "rgba(128, 128, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  // Add some root-like ridges
  ctx.strokeStyle = "rgb(148, 138, 255)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    let x = Math.random() * size;
    let y = Math.random() * size;
    ctx.moveTo(x, y);
    for (let s = 0; s < 5; s++) {
      x += (Math.random() - 0.5) * 60;
      y += Math.random() * 40;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(20, 20);
  tex.colorSpace = LinearSRGBColorSpace;
  return tex;
}

/**
 * Procedural roughness map for jungle floor.
 */
function makeJungleRoughnessMap(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // High roughness base (organic material)
  ctx.fillStyle = "rgb(220, 220, 220)";
  ctx.fillRect(0, 0, size, size);

  // Add variation (wet spots, dry leaves)
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 2 + Math.random() * 6;
    const v = 150 + Math.random() * 100;
    ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(15, 15);
  return tex;
}

/**
 * Shared jungle ground geometry with vertex colors for variation.
 */
function useJungleGeometry() {
  return useMemo(
    () =>
      makeTerrainGeometry({
        width: 130,
        depth: 130,
        widthSegments: 110,
        depthSegments: 110,
        height: jungleHeight,
        colorAt: (x, z, _y, c) => {
          if (onDirtPath(x, z)) {
            c.copy(DIRT).lerp(DIRT_DARK, Math.random() * 0.55);
            return;
          }
          const mossy = Math.max(0, Math.sin(x * 0.24 + 0.8) * Math.cos(z * 0.19 - 1.2));
          const litter = Math.max(0, Math.sin(x * 0.5 - 1.7) * Math.sin(z * 0.42 + 0.6));
          c.copy(EARTH)
            .lerp(LITTER, litter * 0.7)
            .lerp(MOSS, mossy * 0.7)
            .lerp(MOSS_DEEP, Math.max(0, mossy - 0.6))
            .multiplyScalar(0.92 + Math.random() * 0.16);
        },
      }),
    []
  );
}

/**
 * Jungle floor with real PBR textures.
 */
function GroundWithTextures() {
  const geometry = useJungleGeometry();
  const normalScale = useMemo(() => new Vector2(0.6, 0.6), []);

  const [albedoMap, roughnessMap, normalMap, aoMap] = useTexture([
    TEXTURES.jungleFloor.albedo,
    TEXTURES.jungleFloor.roughness,
    TEXTURES.jungleFloor.normal,
    TEXTURES.jungleFloor.ao,
  ]);

  // Configure textures for tiling
  useMemo(() => {
    [albedoMap, roughnessMap, normalMap, aoMap].forEach((tex, i) => {
      tex.wrapS = tex.wrapT = RepeatWrapping;
      tex.repeat.set(18, 18);
      // Albedo is SRGB, others are linear
      tex.colorSpace = i === 0 ? SRGBColorSpace : LinearSRGBColorSpace;
    });
  }, [albedoMap, roughnessMap, normalMap, aoMap]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        map={albedoMap}
        vertexColors
        roughness={0.95}
        roughnessMap={roughnessMap}
        metalness={0}
        normalMap={normalMap}
        normalScale={normalScale}
        aoMap={aoMap}
        aoMapIntensity={0.8}
        envMapIntensity={0.25}
      />
    </mesh>
  );
}

/**
 * Fallback jungle floor with procedural textures.
 */
function ProceduralGround() {
  const geometry = useJungleGeometry();
  const normalMap = useMemo(makeJungleNormalMap, []);
  const roughnessMap = useMemo(makeJungleRoughnessMap, []);
  const normalScale = useMemo(() => new Vector2(0.2, 0.2), []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        vertexColors
        roughness={1}
        roughnessMap={roughnessMap}
        metalness={0}
        normalMap={normalMap}
        normalScale={normalScale}
        envMapIntensity={0.2}
      />
    </mesh>
  );
}

/**
 * Jungle floor: dark earth under deep leaf litter, moss creeping in from
 * the shade, and the worn dirt path/clearing baked in per-vertex.
 * Uses real PBR textures with procedural fallback.
 */
export function Ground() {
  return (
    <Suspense fallback={<ProceduralGround />}>
      <GroundWithTextures />
    </Suspense>
  );
}
