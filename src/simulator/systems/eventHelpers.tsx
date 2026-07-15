import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { SimulatorEvent } from "./EventSystem";

/**
 * Bridges the declarative EventSystem (Stage 3) to visible 3D actors.
 *
 * Each event owns a mutable channel; the event's callbacks write
 * active/progress into it, and the actor component reads it every frame
 * to show/hide and animate itself — no React re-renders while running.
 *
 * Shared by every simulator (promoted from the Coconut scene in Stage 5).
 */
export interface EventChannel {
  active: boolean;
  progress: number; // 0..1 over the event's duration
}

export function makeChannel(): EventChannel {
  return { active: false, progress: 0 };
}

/** Builds a SimulatorEvent whose lifecycle drives the given channel. */
export function channelEvent(
  channel: EventChannel,
  def: Pick<SimulatorEvent, "name" | "duration" | "probability" | "cooldown" | "triggerTime">,
): SimulatorEvent {
  return {
    ...def,
    onStart: () => {
      channel.active = true;
      channel.progress = 0;
    },
    onUpdate: (p) => {
      channel.progress = p;
    },
    onEnd: () => {
      channel.active = false;
    },
  };
}

/**
 * Actor hook: hides the group while idle and calls `animate(group,
 * progress, time)` each frame while its event runs.
 */
export function useEventAnim(
  channel: EventChannel,
  animate: (group: Group, progress: number, time: number) => void,
) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    const group = ref.current;
    if (!group) return;
    group.visible = channel.active;
    if (channel.active) animate(group, channel.progress, clock.elapsedTime);
  });
  return ref;
}

/** Smooth ease for entrances/exits. */
export function easeInOut(t: number): number {
  return t * t * (3 - 2 * t);
}
