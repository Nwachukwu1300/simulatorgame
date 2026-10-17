import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import { useSimulatorStore } from "../state/simulatorStore";

export interface CameraControllerProps {
  /** Fixed camera position. The player can never move it. */
  position?: [number, number, number];
  /** Point the camera looks at (usually the simulator object). */
  target?: [number, number, number];
  /** Amplitude of the idle sway. 0 disables it. */
  swayAmount?: number;
}

const lookTarget = new Vector3();
const BASE_FOV = 45;

/**
 * CameraController — fixed cinematic camera shared by all simulators.
 *
 * There are intentionally no user controls: the player is an inanimate
 * object. A very subtle idle sway keeps the frame from feeling frozen.
 * Sway stops while paused.
 */
export function CameraController({
  position = [3.2, 1.6, 4.2],
  target = [0, 0.5, 0],
  swayAmount = 0.045,
}: CameraControllerProps) {
  const camera = useThree((s) => s.camera);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const elapsed = useRef(0);

  // Framings are composed for landscape, with the object off-centre. On tall phone
  // screens that crops it out, so ease the aim toward the object (every simulator
  // places it at the origin) and widen the view a little. 0 = landscape, 1 = tall phone.
  const portrait = Math.min(1, Math.max(0, (1.2 - aspect) / 0.7));
  const aimAt = (out: Vector3) =>
    out.set(target[0] * (1 - portrait), target[1], target[2] * (1 - portrait));

  useEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      camera.fov = BASE_FOV + 15 * portrait;
      camera.updateProjectionMatrix();
    }
  }, [camera, portrait]);

  // Snap to the configured framing on mount / when the scene changes it.
  useEffect(() => {
    camera.position.set(...position);
    camera.lookAt(aimAt(lookTarget));
  }, [camera, position, target, portrait]);

  useFrame((_, delta) => {
    if (useSimulatorStore.getState().paused) return;
    elapsed.current += delta;
    const t = elapsed.current;
    camera.position.set(
      position[0] + Math.sin(t * 0.32) * swayAmount,
      position[1] + Math.sin(t * 0.21) * swayAmount * 0.6,
      position[2] + Math.cos(t * 0.27) * swayAmount,
    );
    camera.lookAt(aimAt(lookTarget));
  });

  return null;
}
