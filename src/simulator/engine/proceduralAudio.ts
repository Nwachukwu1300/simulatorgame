import { getAudioListener } from "./AudioSystem";

/**
 * Procedural ambience synthesis. The project ships no audio files, so
 * ambient beds (ocean, wind, rain, night) are generated as looped filtered
 * noise, and one-shots (bird chirps, thunder) are synthesized on demand.
 * Everything routes through the Stage 3 AudioSystem listener, so the
 * browser-gesture unlock keeps working.
 */

interface AmbientBed {
  gain: GainNode;
  target: number;
}

const beds = new Map<string, AmbientBed>();
let noiseBuffer: AudioBuffer | null = null;

function ctx(): AudioContext | null {
  const listener = getAudioListener();
  return (listener?.context as AudioContext) ?? null;
}

function output(): AudioNode | null {
  return getAudioListener()?.getInput() ?? null;
}

/** 4s of white noise, shared by every bed. */
function getNoise(c: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const buffer = c.createBuffer(1, c.sampleRate * 4, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buffer;
  return buffer;
}

/**
 * Creates (once) a looped noise bed: noise -> bandpass -> slow LFO on gain.
 * Returns immediately if it already exists. Volume is then driven per-frame
 * via setAmbientLevel.
 */
export function ensureAmbientBed(
  name: string,
  opts: { frequency: number; q: number; lfoRate?: number; lfoDepth?: number },
): void {
  const c = ctx();
  const out = output();
  if (!c || !out || beds.has(name)) return;

  const source = c.createBufferSource();
  source.buffer = getNoise(c);
  source.loop = true;

  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = opts.frequency;
  filter.Q.value = opts.q;

  const gain = c.createGain();
  gain.gain.value = 0;

  source.connect(filter);
  filter.connect(gain);

  // Slow swell (waves rolling, wind gusting)
  if (opts.lfoRate) {
    const lfo = c.createOscillator();
    lfo.frequency.value = opts.lfoRate;
    const lfoGain = c.createGain();
    lfoGain.gain.value = opts.lfoDepth ?? 0.3;
    const swell = c.createGain();
    swell.gain.value = 1 - (opts.lfoDepth ?? 0.3);
    lfo.connect(lfoGain);
    gain.disconnect();
    filter.disconnect();
    filter.connect(swell);
    lfoGain.connect(swell.gain);
    swell.connect(gain);
    lfo.start();
  }

  gain.connect(out);
  source.start();
  beds.set(name, { gain, target: 0 });
}

/** Smoothly retargets a bed's volume (call as often as you like). */
export function setAmbientLevel(name: string, level: number): void {
  const bed = beds.get(name);
  const c = ctx();
  if (!bed || !c) return;
  if (Math.abs(bed.target - level) < 0.005) return;
  bed.target = level;
  bed.gain.gain.setTargetAtTime(level, c.currentTime, 1.2);
}

export function stopAllBeds(): void {
  const c = ctx();
  for (const bed of beds.values()) {
    if (c) bed.gain.gain.setTargetAtTime(0, c.currentTime, 0.3);
    setTimeout(() => bed.gain.disconnect(), 1500);
  }
  beds.clear();
}

/** Short two-note bird chirp with slight random pitch. */
export function birdChirp(volume = 0.08): void {
  const c = ctx();
  const out = output();
  if (!c || !out) return;
  const base = 2200 + Math.random() * 1400;
  for (let n = 0; n < 2; n++) {
    const t0 = c.currentTime + n * (0.12 + Math.random() * 0.08);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(base * (1 + n * 0.12), t0);
    osc.frequency.exponentialRampToValueAtTime(base * 0.7, t0 + 0.09);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.1);
    osc.connect(gain);
    gain.connect(out);
    osc.start(t0);
    osc.stop(t0 + 0.12);
  }
}

/** One or two short dog barks: pitch-swept saw through a bandpass. */
export function dogBark(volume = 0.12): void {
  const c = ctx();
  const out = output();
  if (!c || !out) return;
  const barks = Math.random() < 0.5 ? 1 : 2;
  const base = 320 + Math.random() * 120;
  for (let n = 0; n < barks; n++) {
    const t0 = c.currentTime + n * (0.28 + Math.random() * 0.1);
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(base * 1.4, t0);
    osc.frequency.exponentialRampToValueAtTime(base * 0.8, t0 + 0.12);
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = base * 2.2;
    filter.Q.value = 1.2;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    osc.start(t0);
    osc.stop(t0 + 0.2);
  }
}

/** Distant chiming jingle (ice cream van). Simple pentatonic phrase. */
export function vanJingle(volume = 0.05): void {
  const c = ctx();
  const out = output();
  if (!c || !out) return;
  // "Greensleeves-adjacent" but legally distinct.
  const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 587.33, 659.25];
  notes.forEach((freq, i) => {
    const t0 = c.currentTime + i * 0.32;
    const osc = c.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
    osc.connect(gain);
    gain.connect(out);
    osc.start(t0);
    osc.stop(t0 + 0.65);
  });
}

/** Low rumbling thunder burst, optionally delayed (distance). */
export function thunder(delaySeconds = 0, volume = 0.5): void {
  const c = ctx();
  const out = output();
  if (!c || !out) return;
  const t0 = c.currentTime + delaySeconds;
  const source = c.createBufferSource();
  source.buffer = getNoise(c);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(220, t0);
  filter.frequency.exponentialRampToValueAtTime(60, t0 + 2.5);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.8);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(out);
  source.start(t0);
  source.stop(t0 + 3);
}
