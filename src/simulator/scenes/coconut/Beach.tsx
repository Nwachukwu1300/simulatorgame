import { Suspense, useMemo } from "react";
import { CanvasTexture, Color, RepeatWrapping, LinearSRGBColorSpace, SRGBColorSpace, Vector2 } from "three";
import { useTexture } from "@react-three/drei";
import { makeTerrainGeometry } from "../../effects/terrainGeometry";
import { sandHeight } from "./terrain";
import { TEXTURES } from "../../utils/assetLoader";

const DRY = new Color("#d9c69c");
const WET = new Color("#a8916a");
const UNDERWATER = new Color("#8d7a58");

/**
 * Procedural sand normal map for grain detail.
 * Creates fine granular texture that catches light realistically.
 */
function makeSandNormalMap(): CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Base flat normal (128, 128, 255) pointing up
  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, size, size);

  // Add grain particles as small normal perturbations
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 0.8 + Math.random() * 1.5;
    // Random normal direction with slight upward bias
    const nx = 128 + (Math.random() - 0.5) * 40;
    const ny = 128 + (Math.random() - 0.5) * 40;
    const nz = 220 + Math.random() * 35;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgb(${nx}, ${ny}, ${nz})`);
    grad.addColorStop(1, "rgba(128, 128, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  // Add some larger ripple patterns
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const w = 3 + Math.random() * 8;
    const h = 0.5 + Math.random() * 1;
    const angle = Math.random() * 0.3 - 0.15; // Mostly horizontal ripples

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const nx = 128 + (Math.random() - 0.5) * 25;
    ctx.fillStyle = `rgba(${nx}, 138, 255, 0.3)`;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(40, 40);
  tex.colorSpace = LinearSRGBColorSpace;
  return tex;
}

/**
 * Procedural roughness map for sand - wet areas are smoother.
 */
function makeSandRoughnessMap(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Base roughness (high for dry sand)
  ctx.fillStyle = "rgb(230, 230, 230)";
  ctx.fillRect(0, 0, size, size);

  // Add variation
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 1 + Math.random() * 3;
    const v = 180 + Math.random() * 75;
    ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(30, 30);
  return tex;
}

/**
 * Shared beach geometry with displacement and vertex colors for wetness.
 */
function useBeachGeometry() {
  return useMemo(
    () =>
      makeTerrainGeometry({
        width: 160,
        depth: 70,
        widthSegments: 128,
        depthSegments: 72,
        zOffset: -10,
        height: sandHeight,
        colorAt: (x, z, y, c) => {
          const wetness = 1 - Math.min(1, Math.max(0, (z + 1.2) / 2.8));
          c.copy(DRY).lerp(WET, wetness);
          if (y < 0) c.lerp(UNDERWATER, Math.min(1, -y * 2));
          const grain = 1 + (Math.sin(x * 12.9 + z * 7.7) * 0.5 + Math.sin(x * 3.1) * 0.5) * 0.03;
          c.multiplyScalar(grain);
        },
      }),
    []
  );
}

/**
 * Beach with real PBR textures from downloaded files.
 */
function BeachWithTextures() {
  const geometry = useBeachGeometry();
  const normalScale = useMemo(() => new Vector2(0.3, 0.3), []);

  // Load real textures
  const [albedoMap, roughnessMap] = useTexture([
    TEXTURES.sand.albedo,
    TEXTURES.sand.roughness,
  ]);

  // Configure textures for tiling
  useMemo(() => {
    [albedoMap, roughnessMap].forEach((tex, i) => {
      tex.wrapS = tex.wrapT = RepeatWrapping;
      tex.repeat.set(25, 25);
      tex.colorSpace = i === 0 ? SRGBColorSpace : LinearSRGBColorSpace;
    });
  }, [albedoMap, roughnessMap]);

  // Procedural normal map (since EXR normal maps aren't browser-compatible)
  const normalMap = useMemo(makeSandNormalMap, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        map={albedoMap}
        vertexColors
        roughness={0.92}
        roughnessMap={roughnessMap}
        metalness={0}
        normalMap={normalMap}
        normalScale={normalScale}
        envMapIntensity={0.4}
      />
    </mesh>
  );
}

/**
 * Fallback beach with procedural textures.
 */
function ProceduralBeach() {
  const geometry = useBeachGeometry();
  const normalMap = useMemo(makeSandNormalMap, []);
  const roughnessMap = useMemo(makeSandRoughnessMap, []);
  const normalScale = useMemo(() => new Vector2(0.15, 0.15), []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.95}
        roughnessMap={roughnessMap}
        metalness={0}
        normalMap={normalMap}
        normalScale={normalScale}
        envMapIntensity={0.3}
      />
    </mesh>
  );
}

/**
 * Sandy beach terrain with real PBR textures and procedural fallback.
 * Uses vertex colors for wet/dry gradient that blends with the albedo texture.
 */
export function Beach() {
  return (
    <Suspense fallback={<ProceduralBeach />}>
      <BeachWithTextures />
    </Suspense>
  );
}
