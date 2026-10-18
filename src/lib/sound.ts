/**
 * Interface sounds, synthesised with Web Audio: no audio files, no library.
 * After recent.design, whose sounds are layered recipes: a very short burst
 * of filtered noise for the tick, a short tone for the body.
 *
 * Tuned to this site rather than copied: lower and rounder (soft felt, not
 * bright plastic), and every pitched note sits in D major so the sounds
 * agree with each other.
 *
 * Silent until the first click or key press (browsers keep audio locked
 * until then). Off for anyone who set localStorage.sound = 'off'.
 */

type Tone = {
  type: OscillatorType;
  /** Hz, or [start, end] for a glide over the decay. */
  freq: number | [number, number];
  /** Frequency modulation: modulator at freq × ratio, swinging ±depth Hz. */
  fm?: [ratio: number, depth: number];
};

type Noise = { filter: BiquadFilterType; freq: number; q?: number };

type Layer = (Tone | { noise: Noise }) & {
  /** Seconds to peak, then seconds to fade out. */
  attack?: number;
  decay: number;
  gain: number;
  /** Seconds after the sound starts. */
  delay?: number;
};

// D major: D5 587.33, A5 880.
const D5 = 587.33;
const A5 = 880;

export const SOUNDS = {
  /** Every link and button except About, including the email copying: a
   * soft, deep felt tap. */
  tap: [
    { noise: { filter: 'lowpass', freq: 1200, q: 0.7 }, decay: 0.014, gain: 0.35 },
    { type: 'sine', freq: [D5 / 2, 230], attack: 0.002, decay: 0.07, gain: 0.55 },
    { type: 'sine', freq: [D5, 520], attack: 0.002, decay: 0.035, gain: 0.18, delay: 0.004 },
  ],
  /** About opening: two glass notes stepping up a fifth. */
  open: [
    { type: 'sine', freq: D5, fm: [3, 6], attack: 0.003, decay: 0.09, gain: 0.32 },
    { type: 'sine', freq: A5, fm: [3, 6], attack: 0.003, decay: 0.14, gain: 0.28, delay: 0.055 },
  ],
  /** About closing: the same two notes, stepping back down. */
  close: [
    { type: 'sine', freq: A5, fm: [3, 6], attack: 0.003, decay: 0.07, gain: 0.26 },
    { type: 'sine', freq: D5, fm: [3, 6], attack: 0.003, decay: 0.1, gain: 0.24, delay: 0.05 },
  ],
} satisfies Record<string, Layer[]>;

export type SoundName = keyof typeof SOUNDS;

const VOLUME = 0.35;
/** The same sound can't retrigger faster than this (seconds). */
const MIN_GAP = 0.04;
const SILENT = 0.0001;

let ctx: AudioContext | null = null;
let out: GainNode;
let noiseBuffer: AudioBuffer;
const lastPlayed = new Map<SoundName, number>();

const enabled = () => {
  try {
    return localStorage.getItem('sound') !== 'off';
  } catch {
    return true;
  }
};

/** Call from a user gesture; audio stays locked until one happens. */
export function unlockSound() {
  if (!enabled()) return;
  if (!ctx) {
    ctx = new AudioContext();
    out = new GainNode(ctx, { gain: VOLUME });
    // Rounds off anything harsh before it reaches the speakers.
    const soften = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 6000 });
    out.connect(soften).connect(ctx.destination);
    noiseBuffer = new AudioBuffer({ length: ctx.sampleRate * 0.5, sampleRate: ctx.sampleRate });
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

export function playSound(name: SoundName) {
  if (!ctx || ctx.state !== 'running' || !enabled()) return;
  const now = ctx.currentTime;
  if (now - (lastPlayed.get(name) ?? -1) < MIN_GAP) return;
  lastPlayed.set(name, now);
  for (const layer of SOUNDS[name] as Layer[]) playLayer(ctx, layer, now + (layer.delay ?? 0));
}

function playLayer(ctx: AudioContext, layer: Layer, start: number) {
  const attack = layer.attack ?? 0.001;
  const end = start + attack + layer.decay;

  const envelope = new GainNode(ctx, { gain: SILENT });
  envelope.gain.setValueAtTime(SILENT, start);
  envelope.gain.exponentialRampToValueAtTime(layer.gain, start + attack);
  envelope.gain.exponentialRampToValueAtTime(SILENT, end);
  envelope.connect(out);

  const sources: AudioScheduledSourceNode[] = [];
  if ('noise' in layer) {
    const source = new AudioBufferSourceNode(ctx, { buffer: noiseBuffer });
    const filter = new BiquadFilterNode(ctx, {
      type: layer.noise.filter,
      frequency: layer.noise.freq,
      Q: layer.noise.q ?? 1,
    });
    source.connect(filter).connect(envelope);
    sources.push(source);
  } else {
    const [from, to] = typeof layer.freq === 'number' ? [layer.freq, layer.freq] : layer.freq;
    const osc = new OscillatorNode(ctx, { type: layer.type, frequency: from });
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, end);
    if (layer.fm) {
      const [ratio, depth] = layer.fm;
      const mod = new OscillatorNode(ctx, { frequency: from * ratio });
      mod.connect(new GainNode(ctx, { gain: depth })).connect(osc.frequency);
      sources.push(mod);
    }
    osc.connect(envelope);
    sources.push(osc);
  }

  for (const source of sources) {
    source.start(start);
    source.stop(end + 0.02);
  }
  sources[sources.length - 1].onended = () => envelope.disconnect();
}
