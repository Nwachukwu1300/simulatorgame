/**
 * Safari (iOS especially) keeps an AudioContext silent unless it is created or resumed
 * inside a user gesture. The engine only mounts after the click that starts a
 * simulator, and players never give input again, so the context is created here,
 * during that click, and the engine adopts it. No three.js import: the menus stay light.
 */

let context: AudioContext | null = null;

/** Call from the click/keypress that starts a simulator. */
export function unlockAudio(): void {
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
  } catch {
    // No Web Audio support: the simulation is silent, which it bears with dignity.
  }
}

/** The gesture-unlocked context, if any, for the engine to adopt. */
export function getUnlockedAudioContext(): AudioContext | null {
  return context;
}
