export const DEFAULT_PARAMS = {
  waveform: 'square',
  attack: 0.0,
  sustain: 0.18,
  sustainPunch: 0.25,
  decay: 0.25,
  startFreq: 0.45,
  minFreq: 0.0,
  slide: 0.0,
  deltaSlide: 0.0,
  vibratoDepth: 0.0,
  vibratoSpeed: 0.0,
  arpMod: 0.0,
  arpSpeed: 0.0,
  dutyCycle: 0.0,
  dutySweep: 0.0,
  phaserOffset: 0.0,
  phaserSweep: 0.0,
  lpfCutoff: 1.0,
  lpfSweep: 0.0,
  lpfResonance: 0.0,
  hpfCutoff: 0.0,
  hpfSweep: 0.0,
  volume: 0.6
};

const rnd = (min = 0, max = 1) => min + Math.random() * (max - min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const PRESET_GENERATORS = {
  pickup() {
    const p = { ...DEFAULT_PARAMS, waveform: pick(['square', 'triangle']) };
    p.startFreq = rnd(0.4, 0.9);
    p.attack = 0.0;
    p.sustain = rnd(0.05, 0.15);
    p.decay = rnd(0.1, 0.4);
    p.sustainPunch = rnd(0.3, 0.6);
    if (Math.random() > 0.4) {
      p.arpSpeed = rnd(0.5, 0.75);
      p.arpMod = rnd(0.2, 0.6);
    }
    return p;
  },
  laser() {
    const p = { ...DEFAULT_PARAMS, waveform: pick(['square', 'sawtooth', 'sine']) };
    p.startFreq = rnd(0.5, 1.0);
    p.minFreq = Math.max(0.05, p.startFreq - rnd(0.2, 0.6));
    p.slide = -rnd(0.15, 0.45);
    p.sustain = rnd(0.1, 0.25);
    p.decay = rnd(0.05, 0.2);
    p.dutyCycle = rnd(0, 0.5);
    return p;
  },
  explosion() {
    const p = { ...DEFAULT_PARAMS, waveform: 'noise' };
    p.startFreq = rnd(0.1, 0.4);
    p.slide = -rnd(0.05, 0.3);
    p.sustain = rnd(0.15, 0.4);
    p.decay = rnd(0.3, 0.65);
    p.sustainPunch = rnd(0.2, 0.8);
    p.lpfCutoff = rnd(0.4, 0.9);
    return p;
  },
  powerup() {
    const p = { ...DEFAULT_PARAMS, waveform: pick(['square', 'sawtooth']) };
    p.startFreq = rnd(0.2, 0.5);
    p.slide = rnd(0.1, 0.35);
    p.sustain = rnd(0.15, 0.4);
    p.decay = rnd(0.15, 0.4);
    p.vibratoDepth = rnd(0.1, 0.4);
    p.vibratoSpeed = rnd(0.3, 0.7);
    return p;
  },
  hit() {
    const p = { ...DEFAULT_PARAMS, waveform: pick(['noise', 'sawtooth', 'square']) };
    p.startFreq = rnd(0.2, 0.6);
    p.slide = -rnd(0.3, 0.6);
    p.sustain = rnd(0.03, 0.12);
    p.decay = rnd(0.1, 0.25);
    p.hpfCutoff = rnd(0.1, 0.4);
    return p;
  },
  jump() {
    const p = { ...DEFAULT_PARAMS, waveform: 'square' };
    p.startFreq = rnd(0.25, 0.55);
    p.slide = rnd(0.15, 0.35);
    p.sustain = rnd(0.1, 0.25);
    p.decay = rnd(0.1, 0.25);
    p.dutyCycle = rnd(0, 0.5);
    return p;
  },
  blip() {
    const p = { ...DEFAULT_PARAMS, waveform: pick(['square', 'sine', 'triangle']) };
    p.startFreq = rnd(0.3, 0.7);
    p.sustain = rnd(0.02, 0.08);
    p.decay = rnd(0.03, 0.1);
    return p;
  }
};

export function randomizeParams() {
  const keys = Object.keys(PRESET_GENERATORS);
  const p = PRESET_GENERATORS[pick(keys)]();
  p.waveform = pick(['square', 'sawtooth', 'sine', 'triangle', 'noise']);
  return p;
}

export function mutateParams(params, amount = 0.08) {
  const mutated = { ...params };
  for (const key of Object.keys(mutated)) {
    if (key === 'waveform' || key === 'volume') continue;
    if (Math.random() < 0.5) {
      mutated[key] = Math.max(-1, Math.min(1, mutated[key] + rnd(-amount, amount)));
    }
  }
  return mutated;
}
