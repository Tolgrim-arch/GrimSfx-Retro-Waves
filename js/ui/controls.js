import { t } from '../i18n/i18n.js';

export const CONTROL_GROUPS = [
  {
    titleKey: 'sections.envelope',
    accent: 'text-cyan-400',
    items: [
      { key: 'attack', min: 0, max: 1, step: 0.01 },
      { key: 'sustain', min: 0, max: 1, step: 0.01 },
      { key: 'sustainPunch', min: 0, max: 1, step: 0.01 },
      { key: 'decay', min: 0, max: 1, step: 0.01 }
    ]
  },
  {
    titleKey: 'sections.frequency',
    accent: 'text-amber-400',
    items: [
      { key: 'startFreq', min: 0, max: 1, step: 0.01 },
      { key: 'minFreq', min: 0, max: 1, step: 0.01 },
      { key: 'slide', min: -1, max: 1, step: 0.01, variant: 'bipolar' },
      { key: 'deltaSlide', min: -1, max: 1, step: 0.01, variant: 'bipolar' }
    ]
  },
  {
    titleKey: 'sections.vibrato',
    accent: 'text-emerald-400',
    items: [
      { key: 'vibratoDepth', min: 0, max: 1, step: 0.01 },
      { key: 'vibratoSpeed', min: 0, max: 1, step: 0.01 },
      { key: 'arpMod', min: -1, max: 1, step: 0.01, variant: 'bipolar' },
      { key: 'arpSpeed', min: 0, max: 1, step: 0.01 }
    ]
  },
  {
    titleKey: 'sections.dutyAndFilter',
    accent: 'text-pink-400',
    items: [
      { key: 'dutyCycle', min: 0, max: 1, step: 0.01 },
      { key: 'dutySweep', min: -1, max: 1, step: 0.01, variant: 'bipolar' },
      { key: 'lpfCutoff', min: 0, max: 1, step: 0.01, variant: 'filter-slider' },
      { key: 'lpfSweep', min: -1, max: 1, step: 0.01, variant: 'filter-slider' },
      { key: 'lpfResonance', min: 0, max: 1, step: 0.01, variant: 'filter-slider' },
      { key: 'hpfCutoff', min: 0, max: 1, step: 0.01, variant: 'filter-slider' },
      { key: 'hpfSweep', min: -1, max: 1, step: 0.01, variant: 'filter-slider' }
    ]
  },
  {
    titleKey: 'sections.effects',
    accent: 'text-purple-400',
    items: [
      { key: 'phaserOffset', min: -1, max: 1, step: 0.01, variant: 'bipolar' },
      { key: 'phaserSweep', min: -1, max: 1, step: 0.01, variant: 'bipolar' },
      { key: 'volume', min: 0, max: 1, step: 0.01 }
    ]
  }
];

export function renderControls(container, params, onChange) {
  container.innerHTML = '';

  CONTROL_GROUPS.forEach((group) => {
    const card = document.createElement('section');
    card.className = 'bg-[#11131c] border border-[#1e2233] rounded-xl p-4 flex flex-col gap-3';

    const heading = document.createElement('h3');
    heading.className = `font-mono-tech text-xs font-bold tracking-wider ${group.accent}`;
    heading.setAttribute('data-i18n', group.titleKey);
    heading.textContent = t(group.titleKey);
    card.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3';

    group.items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'flex flex-col gap-1';

      const header = document.createElement('div');
      header.className = 'flex justify-between items-center text-xs';

      const label = document.createElement('label');
      label.className = 'text-slate-300';
      label.setAttribute('data-i18n', `controls.${item.key}`);
      label.textContent = t(`controls.${item.key}`);

      const valueSpan = document.createElement('span');
      valueSpan.className = 'font-mono-tech text-[11px] text-cyan-300';
      valueSpan.id = `val-${item.key}`;
      valueSpan.textContent = Number(params[item.key]).toFixed(2);

      header.appendChild(label);
      header.appendChild(valueSpan);

      const input = document.createElement('input');
      input.type = 'range';
      input.min = item.min;
      input.max = item.max;
      input.step = item.step;
      input.value = params[item.key];
      input.id = `ctrl-${item.key}`;
      if (item.variant) input.classList.add(item.variant);

      input.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        valueSpan.textContent = val.toFixed(2);
        onChange(item.key, val, false);
      });

      input.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        onChange(item.key, val, true);
      });

      row.appendChild(header);
      row.appendChild(input);
      list.appendChild(row);
    });

    card.appendChild(list);
    container.appendChild(card);
  });
}

export function syncControls(params) {
  CONTROL_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      const input = document.getElementById(`ctrl-${item.key}`);
      const valSpan = document.getElementById(`val-${item.key}`);
      if (input) input.value = params[item.key];
      if (valSpan) valSpan.textContent = Number(params[item.key]).toFixed(2);
    });
  });
}
