import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshStandardMaterial, PlaneGeometry } from "three";
import type { IUniform } from "three";

/**
 * Ocean — a large plane whose vertices are displaced in the vertex shader
 * (sum of moving sine waves) with analytic normals, so the water surface
 * and its sun glints animate at zero CPU cost. Extends to the fog line.
 */
export function Ocean() {
  const uTime = useRef<IUniform<number>>({ value: 0 });

  const { geometry, material } = useMemo(() => {
    const geo = new PlaneGeometry(400, 260, 96, 96);
    geo.rotateX(-Math.PI / 2);

    const mat = new MeshStandardMaterial({
      color: "#1d6a86",
      roughness: 0.22,
      metalness: 0.05,
      transparent: true,
      opacity: 0.96,
    });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uTime.current;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          /* glsl */ `
          #include <common>
          uniform float uTime;
          float waveH(vec2 p) {
            return sin(p.x * 0.18 + uTime * 0.9) * 0.22
                 + sin(p.y * 0.24 - uTime * 0.7) * 0.18
                 + sin((p.x + p.y) * 0.45 + uTime * 1.4) * 0.07
                 + sin(p.x * 1.1 - uTime * 2.1) * 0.025;
          }`,
        )
        .replace(
          "#include <beginnormal_vertex>",
          /* glsl */ `
          #include <beginnormal_vertex>
          {
            float e = 0.6;
            vec2 p = position.xz;
            float hx = waveH(p + vec2(e, 0.0)) - waveH(p - vec2(e, 0.0));
            float hz = waveH(p + vec2(0.0, e)) - waveH(p - vec2(0.0, e));
            objectNormal = normalize(vec3(-hx / (2.0 * e), 1.0, -hz / (2.0 * e)));
          }`,
        )
        .replace(
          "#include <begin_vertex>",
          /* glsl */ `
          #include <begin_vertex>
          transformed.y += waveH(position.xz);`,
        );
    };
    return { geometry: geo, material: mat };
  }, []);

  useFrame((_, delta) => {
    uTime.current.value += delta;
  });

  return <mesh geometry={geometry} material={material} position={[0, 0, -130]} />;
}
