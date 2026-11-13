import { applyTranslations, getLanguage, onLanguageChange, setLanguage, t } from './i18n/i18n.js';
import { synthesizeBuffer, playBuffer } from './audio/synth-engine.js';
import { DEFAULT_PARAMS, PRESET_GENERATORS, mutateParams, randomizeParams } from './audio/presets.js';
import { exportWav } from './audio/wav-exporter.js';
import { renderControls, syncControls } from './ui/controls.js';
import { drawWaveform } from './ui/visualizer.js';
import { addHistoryItem, renderHistory } from './ui/history.js';

let currentParams = { ...DEFAULT_PARAMS };
let lastBuffer = null;

const controlsContainer = document.getElementById('controls-container');
const historyContainer = document.getElementById('history-container');
const canvas = document.getElementById('oscilloscope');
const langBtn = document.getElementById('lang-toggle');

function updateWaveButtons() {
  document.querySelectorAll('.wave-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.wave === currentParams.waveform);
  });
}

function triggerPlay(recordLabel = null) {
  lastBuffer = synthesizeBuffer(currentParams);
  playBuffer(lastBuffer);
  drawWaveform(canvas, lastBuffer);
  if (recordLabel) {
    addHistoryItem(recordLabel, currentParams);
    renderHistory(historyContainer, (params) => {
      currentParams = { ...params };
      syncControls(currentParams);
      updateWaveButtons();
      triggerPlay();
    });
  }
}

function init() {
  applyTranslations();
  if (langBtn) {
    langBtn.textContent = getLanguage().toUpperCase();
    langBtn.addEventListener('click', () => {
      const next = getLanguage() === 'es' ? 'en' : 'es';
      setLanguage(next);
      langBtn.textContent = next.toUpperCase();
    });
  }

  onLanguageChange(() => {
    renderHistory(historyContainer, (params) => {
      currentParams = { ...params };
      syncControls(currentParams);
      updateWaveButtons();
      triggerPlay();
    });
  });

  renderControls(controlsContainer, currentParams, (key, value, shouldPlay) => {
    currentParams[key] = value;
    if (shouldPlay) triggerPlay();
  });

  document.querySelectorAll('.wave-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentParams.waveform = btn.dataset.wave;
      updateWaveButtons();
      triggerPlay();
    });
  });

  document.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.preset;
      if (PRESET_GENERATORS[key]) {
        currentParams = PRESET_GENERATORS[key]();
        syncControls(currentParams);
        updateWaveButtons();
        triggerPlay(t(`presets.${key}`));
      }
    });
  });

  document.getElementById('btn-play')?.addEventListener('click', () => triggerPlay());
  document.getElementById('btn-mutate')?.addEventListener('click', () => {
    currentParams = mutateParams(currentParams);
    syncControls(currentParams);
    triggerPlay(t('app.mutate'));
  });
  document.getElementById('btn-random')?.addEventListener('click', () => {
    currentParams = randomizeParams();
    syncControls(currentParams);
    updateWaveButtons();
    triggerPlay(t('app.randomize'));
  });
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    currentParams = { ...DEFAULT_PARAMS };
    syncControls(currentParams);
    updateWaveButtons();
    triggerPlay();
  });
  document.getElementById('btn-export')?.addEventListener('click', () => {
    if (!lastBuffer) lastBuffer = synthesizeBuffer(currentParams);
    exportWav(lastBuffer, `grimsfx-${currentParams.waveform}-${Date.now()}.wav`);
  });
  document.getElementById('btn-copy-json')?.addEventListener('click', async (e) => {
    await navigator.clipboard.writeText(JSON.stringify(currentParams, null, 2));
    const btn = e.currentTarget;
    const original = btn.textContent;
    btn.textContent = t('app.copied');
    setTimeout(() => { btn.textContent = original; }, 1200);
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
      triggerPlay();
    }
  });

  window.addEventListener('resize', () => {
    if (lastBuffer) drawWaveform(canvas, lastBuffer);
  });

  updateWaveButtons();
  renderHistory(historyContainer, () => {});
  lastBuffer = synthesizeBuffer(currentParams);
  drawWaveform(canvas, lastBuffer);
}

init();
