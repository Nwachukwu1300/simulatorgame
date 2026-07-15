import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Audio, AudioListener, AudioLoader } from "three";

/**
 * AudioSystem — foundation for ambient and positional audio.
 *
 * Stage 3 scope:
 * - Attaches a single THREE.AudioListener to the active camera.
 * - Unlocks the browser AudioContext on the first user gesture
 *   (required by autoplay policies).
 * - Exposes `playAmbient` for future scenes to loop environment beds
 *   (ocean, park chatter, jungle...). No sounds ship yet.
 */

let listener: AudioListener | null = null;
const ambientChannels = new Map<string, Audio>();
const audioLoader = new AudioLoader();

/** The shared listener. Available after the SimulatorCanvas has mounted. */
export function getAudioListener(): AudioListener | null {
  return listener;
}

/**
 * Loads and loops an ambient sound. Future simulators call this from their
 * scene (e.g. playAmbient("ocean", "/audio/ocean.ogg", 0.6)).
 */
export function playAmbient(name: string, url: string, volume = 0.5): void {
  if (!listener) return;
  const existing = ambientChannels.get(name);
  if (existing) {
    existing.setVolume(volume);
    if (!existing.isPlaying) existing.play();
    return;
  }
  const channel = new Audio(listener);
  ambientChannels.set(name, channel);
  audioLoader.load(url, (buffer) => {
    channel.setBuffer(buffer);
    channel.setLoop(true);
    channel.setVolume(volume);
    channel.play();
  });
}

export function stopAmbient(name: string): void {
  const channel = ambientChannels.get(name);
  if (channel?.isPlaying) channel.stop();
}

export function stopAllAmbient(): void {
  for (const channel of ambientChannels.values()) {
    if (channel.isPlaying) channel.stop();
  }
  ambientChannels.clear();
}

export function AudioSystem() {
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    if (!listener) listener = new AudioListener();
    camera.add(listener);

    // Browsers suspend the AudioContext until a user gesture.
    const unlock = () => {
      const ctx = listener?.context;
      if (ctx && ctx.state === "suspended") void ctx.resume();
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      if (listener) camera.remove(listener);
      stopAllAmbient();
    };
  }, [camera]);

  return null;
}
