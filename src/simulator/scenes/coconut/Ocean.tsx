import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshPhysicalMaterial, PlaneGeometry, Color } from "three";
import type { IUniform } from "three";

/**
 * Ocean — realistic tropical water with Gerstner waves.
 *
 * Features:
 * - Gerstner wave displacement for realistic wave shapes (steep crests, flat troughs)
 * - Multiple wave directions for natural interference patterns
 * - Fresnel-based reflection/transmission blending
 * - Environment map reflections via MeshPhysicalMaterial
 * - Subtle foam at wave peaks
 */
export function Ocean() {
  const uTime = useRef<IUniform<number>>({ value: 0 });

  const { geometry, material } = useMemo(() => {
    // Higher resolution for smoother Gerstner waves
    const geo = new PlaneGeometry(400, 260, 192, 128);
    geo.rotateX(-Math.PI / 2);

    // Use MeshPhysicalMaterial for better reflections and transmission
    const mat = new MeshPhysicalMaterial({
      color: new Color("#0a5a6e"),
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.92,
      transmission: 0.15,
      thickness: 2.0,
      ior: 1.33, // Water's index of refraction
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.2,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uTime.current;

      // Gerstner wave implementation in vertex shader
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          /* glsl */ `
          #include <common>
          uniform float uTime;

          // Gerstner wave function
          // Returns vec3: xy = horizontal displacement, z = vertical displacement
          vec3 gerstnerWave(vec2 pos, vec2 dir, float steepness, float wavelength, float speed) {
            float k = 2.0 * PI / wavelength;
            float c = sqrt(9.8 / k);
            vec2 d = normalize(dir);
            float f = k * (dot(d, pos) - c * speed * uTime);
            float a = steepness / k;

            return vec3(
              d.x * a * cos(f),
              d.y * a * cos(f),
              a * sin(f)
            );
          }

          // Sum of multiple Gerstner waves for natural ocean
          vec3 calcWaves(vec2 pos) {
            vec3 wave = vec3(0.0);

            // Primary swell - long, slow waves from the horizon
            wave += gerstnerWave(pos, vec2(0.0, 1.0), 0.15, 28.0, 0.8);
            wave += gerstnerWave(pos, vec2(0.2, 0.98), 0.12, 22.0, 0.9);

            // Secondary waves - medium wavelength, slight angle
            wave += gerstnerWave(pos, vec2(-0.15, 0.99), 0.1, 14.0, 1.0);
            wave += gerstnerWave(pos, vec2(0.1, 0.995), 0.08, 10.0, 1.1);

            // Chop - short, fast waves for surface detail
            wave += gerstnerWave(pos, vec2(0.3, 0.95), 0.04, 5.0, 1.4);
            wave += gerstnerWave(pos, vec2(-0.25, 0.97), 0.03, 3.5, 1.6);

            // Ripples - very fine detail
            wave += gerstnerWave(pos, vec2(0.5, 0.87), 0.015, 1.8, 2.0);

            return wave;
          }`,
        )
        .replace(
          "#include <beginnormal_vertex>",
          /* glsl */ `
          #include <beginnormal_vertex>
          {
            // Calculate normal from wave gradient
            float e = 0.3;
            vec2 p = position.xz;

            vec3 waveC = calcWaves(p);
            vec3 waveX = calcWaves(p + vec2(e, 0.0));
            vec3 waveZ = calcWaves(p + vec2(0.0, e));

            vec3 tangentX = vec3(e + waveX.x - waveC.x, waveX.z - waveC.z, waveX.y - waveC.y);
            vec3 tangentZ = vec3(waveZ.x - waveC.x, waveZ.z - waveC.z, e + waveZ.y - waveC.y);

            objectNormal = normalize(cross(tangentZ, tangentX));
          }`,
        )
        .replace(
          "#include <begin_vertex>",
          /* glsl */ `
          #include <begin_vertex>
          vec3 wave = calcWaves(position.xz);
          transformed.x += wave.x;
          transformed.z += wave.y;
          transformed.y += wave.z;`,
        );

      // Add fresnel effect in fragment shader for more realistic water
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          /* glsl */ `
          #include <common>

          // Schlick's fresnel approximation
          float fresnelSchlick(float cosTheta, float f0) {
            return f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0);
          }`,
        )
        .replace(
          "#include <output_fragment>",
          /* glsl */ `
          // Apply fresnel to increase reflectivity at grazing angles
          vec3 viewDir = normalize(vViewPosition);
          float NdotV = max(dot(normal, viewDir), 0.0);
          float fresnel = fresnelSchlick(NdotV, 0.02);

          // Blend between water color and sky reflection based on fresnel
          gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 1.3, fresnel * 0.5);
          gl_FragColor.a = mix(gl_FragColor.a, 1.0, fresnel * 0.6);

          #include <output_fragment>`,
        );
    };

    return { geometry: geo, material: mat };
  }, []);

  useFrame((_, delta) => {
    uTime.current.value += delta;
  });

  return <mesh geometry={geometry} material={material} position={[0, 0, -130]} receiveShadow />;
}
