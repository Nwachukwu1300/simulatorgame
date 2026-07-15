import { SimulatorScene } from "./SimulatorScene";
import { SimulatorObject } from "../objects/SimulatorObject";

/**
 * TestScene — temporary Stage 3 environment proving the framework works.
 *
 * Ground plane, a placeholder "object" and a few reference blocks so the
 * day/night lighting and camera sway are visible. Replaced by the real
 * beach / park / jungle scenes in Stages 4-7. Not focused on visuals.
 */
export default function TestScene() {
  return (
    <SimulatorScene
      camera={{ position: [3.2, 1.6, 4.2], target: [0, 0.5, 0] }}
      fog={["#20242c", 18, 70]}
      object={
        <SimulatorObject position={[0, 0.5, 0]} rotation={[0, 0.6, 0]}>
          {/* Placeholder for the coconut / bench / idol model */}
          <mesh castShadow>
            <dodecahedronGeometry args={[0.5]} />
            <meshStandardMaterial color="#8a5c2a" roughness={0.7} />
          </mesh>
        </SimulatorObject>
      }
    >
      {/* Ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[60, 48]} />
        <meshStandardMaterial color="#3d4436" roughness={1} />
      </mesh>

      {/* Reference blocks to read depth, shadows and the sun's arc */}
      {(
        [
          [-3, 0.75, -2, 1.5],
          [4, 0.5, -3.5, 1],
          [-1.5, 0.35, 3, 0.7],
          [6, 1, 2, 2],
        ] as const
      ).map(([x, y, z, h], i) => (
        <mesh key={i} castShadow receiveShadow position={[x, y, z]}>
          <boxGeometry args={[1, h * 2, 1]} />
          <meshStandardMaterial color="#5a5148" roughness={0.9} />
        </mesh>
      ))}
    </SimulatorScene>
  );
}
