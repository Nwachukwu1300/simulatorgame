import { useGLTF, useTexture } from "@react-three/drei";
import { RepeatWrapping, SRGBColorSpace, LinearSRGBColorSpace } from "three";
import type { Texture } from "three";

/**
 * Asset paths configuration.
 * All models should be in GLB format for optimal loading.
 */
export const MODELS = {
  // Main objects
  coconut: "/models/coconut/coconut.glb",

  // Beach environment
  palmTree: "/models/environment/palm_tree.glb",
  rock: "/models/environment/rock.glb",
  rockLarge: "/models/environment/rock_large.glb",

  // Beach props
  dock: "/models/props/dock.glb",
  beachHut: "/models/props/beach_hut.glb",
  umbrella: "/models/props/umbrella.glb",
  seashell: "/models/props/seashell.glb",
} as const;

/**
 * Texture paths - organized by material type.
 * Note: Normal maps from Poly Haven are in EXR format (not browser-compatible).
 * We use procedural normal maps as fallback where file is unavailable.
 */
export const TEXTURES = {
  sand: {
    albedo: "/textures/sand/albedo.jpg",
    roughness: "/textures/sand/roughness.jpg",
    displacement: "/textures/sand/displacement.png",
    // normal: procedural fallback (EXR not supported in browser)
  },
  rock: {
    albedo: "/textures/rock/albedo.jpg",
    displacement: "/textures/rock/displacement.png",
    // normal/roughness: procedural fallback (EXR not supported)
  },
  // Jungle floor textures
  jungleFloor: {
    albedo: "/textures/jungle/floor_albedo.jpg",
    roughness: "/textures/jungle/floor_roughness.jpg",
    normal: "/textures/jungle/floor_normal.jpg",
    ao: "/textures/jungle/floor_ao.jpg",
  },
  // Moss/leaves for variety
  forestMoss: {
    albedo: "/textures/jungle/moss_albedo.jpg",
    roughness: "/textures/jungle/moss_roughness.jpg",
  },
  // Bark texture for trees
  bark: {
    albedo: "/textures/jungle/bark_albedo.jpg",
    roughness: "/textures/jungle/bark_roughness.jpg",
    normal: "/textures/jungle/bark_normal.jpg",
  },
  // Weathered stone for ruins (only albedo available, use procedural for others)
  weatheredStone: {
    albedo: "/textures/jungle/stone_albedo.jpg",
    // roughness/normal/ao: procedural fallback (source files were EXR)
  },
} as const;

export const HDRI = {
  beach: "/hdri/beach.hdr",
  jungle: "/hdri/jungle.hdr",
} as const;

/**
 * Preload models for faster scene loading.
 * Call this at app startup or on the loading screen.
 */
export function preloadModels() {
  Object.values(MODELS).forEach((path) => {
    useGLTF.preload(path);
  });
}

/**
 * Configure a texture for tiling (sand, terrain, etc.)
 */
export function configureTilingTexture(
  texture: Texture,
  repeatX: number,
  repeatY: number,
  isNormalMap = false
): Texture {
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.colorSpace = isNormalMap ? LinearSRGBColorSpace : SRGBColorSpace;
  return texture;
}

/**
 * Hook to load PBR texture set with proper configuration.
 */
export function usePBRTextures(
  paths: { albedo: string; normal: string; roughness: string; ao?: string; displacement?: string },
  repeat: [number, number] = [1, 1]
) {
  const texturePaths = [paths.albedo, paths.normal, paths.roughness];
  if (paths.ao) texturePaths.push(paths.ao);
  if (paths.displacement) texturePaths.push(paths.displacement);

  const textures = useTexture(texturePaths);

  // Configure each texture
  const [albedo, normal, roughness, ao, displacement] = textures;

  configureTilingTexture(albedo, repeat[0], repeat[1], false);
  configureTilingTexture(normal, repeat[0], repeat[1], true);
  configureTilingTexture(roughness, repeat[0], repeat[1], true);
  if (ao) configureTilingTexture(ao, repeat[0], repeat[1], true);
  if (displacement) configureTilingTexture(displacement, repeat[0], repeat[1], true);

  return { albedo, normal, roughness, ao, displacement };
}
