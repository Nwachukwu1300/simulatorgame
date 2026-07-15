import { useMemo } from "react";
import { CanvasTexture, RepeatWrapping } from "three";
import { SimulatorObject } from "../../objects/SimulatorObject";
import { sandHeight } from "./terrain";

/** Procedural fibrous bump texture so the husk catches the light. */
function makeHuskTexture(): CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 900; i++) {
    const shade = 90 + Math.floor(Math.random() * 90);
    ctx.strokeStyle = `rgb(${shade},${shade},${shade})`;
    ctx.lineWidth = 1;
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 4, y + 4 + Math.random() * 8);
    ctx.stroke();
  }
  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

/**
 * The player. A procedurally-textured coconut resting in a slight
 * depression in the sand. It does not move. It will never move.
 */
export function Coconut() {
  const bumpMap = useMemo(makeHuskTexture, []);
  const groundY = sandHeight(0, 0);

  return (
    <SimulatorObject position={[0, groundY + 0.21, 0]} rotation={[0.18, 0.7, -0.08]}>
      {/* Husk */}
      <mesh castShadow scale={[1, 0.88, 0.94]}>
        <sphereGeometry args={[0.27, 32, 24]} />
        <meshStandardMaterial
          color="#6d4a2b"
          roughness={0.95}
          bumpMap={bumpMap}
          bumpScale={0.6}
        />
      </mesh>
      {/* Germination pores */}
      {(
        [
          [0.07, 0.2, 0.16],
          [-0.07, 0.2, 0.16],
          [0, 0.14, 0.22],
        ] as const
      ).map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.028, 12, 8]} />
          <meshStandardMaterial color="#2e1d10" roughness={1} />
        </mesh>
      ))}
      {/* Depression in the sand where it has always rested */}
      <mesh position={[0, -0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 24]} />
        <meshStandardMaterial color="#b59a70" roughness={1} />
      </mesh>
    </SimulatorObject>
  );
}
