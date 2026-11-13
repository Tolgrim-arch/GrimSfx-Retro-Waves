const SAMPLE_RATE = 44100;

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx({ sampleRate: SAMPLE_RATE });
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function synthesizeBuffer(params) {
  const p = { ...params };
  const attack = Math.pow(p.attack, 2) * 100000;
  const sustain = Math.pow(p.sustain, 2) * 100000;
  const decay = Math.pow(p.decay, 2) * 100000;
  const totalSamples = Math.min(SAMPLE_RATE * 4, Math.max(1024, Math.floor(attack + sustain + decay)));

  const buffer = new Float32Array(totalSamples);

  let period = 100.0 / (p.startFreq * p.startFreq + 0.001);
  const maxPeriod = 100.0 / (p.minFreq * p.minFreq + 0.001);
  let slide = 1.0 - Math.pow(p.slide, 3) * 0.01;
  const deltaSlide = -Math.pow(p.deltaSlide, 3) * 0.000001;

  let squareDuty = 0.5 - p.dutyCycle * 0.5;
  const dutySweep = -p.dutySweep * 0.00005;

  let arpMult = p.arpMod >= 0 ? 1.0 - Math.pow(p.arpMod, 2) * 0.9 : 1.0 + Math.pow(p.arpMod, 2) * 10.0;
  let arpTime = 0;
  const arpLimit = p.arpSpeed === 1.0 ? 0 : Math.floor(Math.pow(1.0 - p.arpSpeed, 2) * 20000 + 32);

  let vibPhase = 0;
  const vibSpeed = Math.pow(p.vibratoSpeed, 2) * 0.01;
  const vibAmp = p.vibratoDepth * 0.5;

  let fltp = 0;
  let fltdp = 0;
  let fltw = Math.pow(p.lpfCutoff, 3) * 0.1;
  const fltwD = 1.0 + p.lpfSweep * 0.0001;
  const fltdmp = Math.min(0.8, (5.0 / (1.0 + Math.pow(p.lpfResonance, 2) * 20.0)) * (0.01 + fltw));
  let fltphp = 0;
  let flthp = Math.pow(p.hpfCutoff, 2) * 0.1;
  const flthpD = 1.0 + p.hpfSweep * 0.0003;

  const phaserBuffer = new Float32Array(1024);
  let phaserPos = 0;
  let fphase = Math.pow(p.phaserOffset, 2) * 1020.0 * (p.phaserOffset < 0 ? -1 : 1);
  const fdphase = Math.pow(p.phaserSweep, 2) * 1.0 * (p.phaserSweep < 0 ? -1 : 1);

  const noiseBuffer = new Float32Array(32);
  for (let i = 0; i < 32; i++) noiseBuffer[i] = Math.random() * 2.0 - 1.0;

  let phase = 0;
  let envStage = 0;
  let envTime = 0;

  for (let i = 0; i < totalSamples; i++) {
    envTime++;
    if (envStage === 0 && envTime >= attack) { envStage = 1; envTime = 0; }
    if (envStage === 1 && envTime >= sustain) { envStage = 2; envTime = 0; }

    let envVol = 0;
    if (envStage === 0) envVol = attack > 0 ? envTime / attack : 1.0;
    else if (envStage === 1) envVol = 1.0 + Math.pow(1.0 - envTime / Math.max(1, sustain), 1.0) * 2.0 * p.sustainPunch;
    else envVol = Math.max(0, 1.0 - envTime / Math.max(1, decay));

    arpTime++;
    if (arpLimit !== 0 && arpTime >= arpLimit) {
      arpTime = 0;
      period *= arpMult;
    }

    slide += deltaSlide;
    period *= slide;
    if (period > maxPeriod) period = maxPeriod;

    vibPhase += vibSpeed;
    const rfperiod = Math.max(8, period * (1.0 + Math.sin(vibPhase) * vibAmp));

    squareDuty = Math.max(0.0, Math.min(0.5, squareDuty + dutySweep));

    let sample = 0;
    for (let si = 0; si < 8; si++) {
      phase++;
      if (phase >= rfperiod) {
        phase %= rfperiod;
        if (p.waveform === 'noise') {
          for (let n = 0; n < 32; n++) noiseBuffer[n] = Math.random() * 2.0 - 1.0;
        }
      }

      const fp = phase / rfperiod;
      let sub = 0;
      switch (p.waveform) {
        case 'square':
          sub = fp < squareDuty ? 0.5 : -0.5;
          break;
        case 'sawtooth':
          sub = 1.0 - fp * 2.0;
          break;
        case 'sine':
          sub = Math.sin(fp * Math.PI * 2.0);
          break;
        case 'triangle':
          sub = fp < 0.5 ? fp * 4.0 - 1.0 : 3.0 - fp * 4.0;
          break;
        case 'noise':
          sub = noiseBuffer[Math.floor(fp * 32) % 32];
          break;
      }

      // Low-pass & high-pass filters
      const pp = fltp;
      fltw = Math.max(0.0, Math.min(0.1, fltw * fltwD));
      if (p.lpfCutoff !== 1.0) {
        fltdp += (sub - fltp) * fltw;
        fltdp -= fltdp * fltdmp;
      } else {
        fltp = sub;
        fltdp = 0;
      }
      fltp += fltdp;

      fltphp += fltp - pp;
      flthp = Math.max(0.00001, Math.min(0.1, flthp * flthpD));
      fltphp -= fltphp * flthp;
      sub = fltphp;

      // Phaser
      fphase += fdphase;
      const iphase = Math.min(1023, Math.abs(Math.floor(fphase)));
      phaserBuffer[phaserPos & 1023] = sub;
      sub += phaserBuffer[(phaserPos - iphase + 1024) & 1023];
      phaserPos = (phaserPos + 1) & 1023;

      sample += sub;
    }

    sample = (sample / 8.0) * envVol * p.volume * 0.5;
    buffer[i] = Math.max(-1, Math.min(1, sample));
  }

  return buffer;
}

export function playBuffer(buffer) {
  const ctx = getAudioContext();
  const audioBuffer = ctx.createBuffer(1, buffer.length, SAMPLE_RATE);
  audioBuffer.getChannelData(0).set(buffer);

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  source.start();
  return source;
}
