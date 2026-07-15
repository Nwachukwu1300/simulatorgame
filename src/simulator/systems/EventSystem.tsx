import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSimulatorStore } from "../state/simulatorStore";

/**
 * EventSystem — foundation for scripted background events (Stage 3/5).
 *
 * Simulators pass a declarative list of events; the scheduler rolls
 * probabilities and fires callbacks. No events are defined yet — Stage 4+
 * will supply them (crab walks past, seagull flies overhead, UFO...).
 */

export interface SimulatorEvent {
  /** Unique name, e.g. "crab-walks-past". */
  name: string;
  /**
   * Optional fixed time of day (hours, 0-24) at which the event fires,
   * e.g. 18.5 for a sunset event. Omit for random events.
   */
  triggerTime?: number;
  /** How long the event runs, in real seconds. */
  duration: number;
  /**
   * For random events: chance [0-1] of firing per probability roll.
   * Rolls happen every `checkInterval` seconds while the event is idle.
   */
  probability: number;
  /** Minimum real seconds between two occurrences of this event. */
  cooldown?: number;
  /** Called once when the event starts. */
  onStart?: () => void;
  /** Called every frame while active, with progress in [0, 1]. */
  onUpdate?: (progress: number) => void;
  /** Called once when the event ends. */
  onEnd?: () => void;
}

interface EventRuntime {
  event: SimulatorEvent;
  active: boolean;
  elapsed: number;
  cooldownRemaining: number;
  firedAtTriggerTime: boolean;
}

export interface EventSystemProps {
  events: SimulatorEvent[];
  /** Real seconds between probability rolls for random events. */
  checkInterval?: number;
}

const DEFAULT_COOLDOWN = 30;

/**
 * Mount once per scene: <EventSystem events={BEACH_EVENTS} />
 * Renders nothing; runs entirely inside the frameloop. Paused with the sim.
 */
export function EventSystem({ events, checkInterval = 5 }: EventSystemProps) {
  const runtimes = useRef<EventRuntime[]>(
    events.map((event) => ({
      event,
      active: false,
      elapsed: 0,
      cooldownRemaining: 0,
      firedAtTriggerTime: false,
    })),
  );
  const untilNextRoll = useRef(checkInterval);

  useFrame((_, delta) => {
    const { paused, timeOfDay } = useSimulatorStore.getState();
    if (paused) return;

    untilNextRoll.current -= delta;
    const rollNow = untilNextRoll.current <= 0;
    if (rollNow) untilNextRoll.current = checkInterval;

    for (const rt of runtimes.current) {
      const { event } = rt;

      if (rt.active) {
        rt.elapsed += delta;
        const progress = Math.min(1, rt.elapsed / event.duration);
        event.onUpdate?.(progress);
        if (progress >= 1) {
          rt.active = false;
          rt.cooldownRemaining = event.cooldown ?? DEFAULT_COOLDOWN;
          event.onEnd?.();
        }
        continue;
      }

      if (rt.cooldownRemaining > 0) {
        rt.cooldownRemaining -= delta;
        continue;
      }

      // Timed events: fire once when the sim clock crosses triggerTime.
      if (event.triggerTime !== undefined) {
        const crossed = Math.abs(timeOfDay - event.triggerTime) < 0.05;
        if (crossed && !rt.firedAtTriggerTime) {
          start(rt);
          rt.firedAtTriggerTime = true;
        } else if (!crossed) {
          rt.firedAtTriggerTime = false;
        }
        continue;
      }

      // Random events: probability roll every checkInterval.
      if (rollNow && Math.random() < event.probability) {
        start(rt);
      }
    }
  });

  return null;
}

function start(rt: EventRuntime) {
  rt.active = true;
  rt.elapsed = 0;
  rt.event.onStart?.();
}
