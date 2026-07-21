import { EffectComposer, Bloom, Vignette, BrightnessContrast, HueSaturation } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

/**
 * PostProcessingEffects — subtle cinematic post-processing for high quality mode.
 *
 * - Bloom: Soft glow on bright areas (sun reflections, highlights)
 * - Vignette: Subtle darkening at edges for cinematic framing
 * - Color grading: Slight warmth and contrast boost for that golden hour feel
 *
 * Effects are intentionally restrained to keep the beach readable in daylight.
 */
export function PostProcessingEffects() {
  return (
    <EffectComposer multisampling={0}>
      {/* Subtle bloom for sun glints and highlights */}
      <Bloom
        intensity={0.3}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      {/* Soft vignette for cinematic framing */}
      <Vignette
        offset={0.3}
        darkness={0.4}
        blendFunction={BlendFunction.NORMAL}
      />
      {/* Slight warmth and contrast for golden hour feel */}
      <BrightnessContrast
        brightness={0.02}
        contrast={0.08}
      />
      <HueSaturation
        hue={0.02}
        saturation={0.1}
      />
    </EffectComposer>
  );
}
