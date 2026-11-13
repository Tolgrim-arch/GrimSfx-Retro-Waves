import { t } from '../i18n/i18n.js';

const MAX_HISTORY = 12;
const historyItems = [];

export function addHistoryItem(label, params) {
  historyItems.unshift({
    id: Date.now() + Math.random(),
    label,
    params: { ...params }
  });
  if (historyItems.length > MAX_HISTORY) {
    historyItems.pop();
  }
}

export function renderHistory(container, onSelect) {
  container.innerHTML = '';
  if (historyItems.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'text-xs text-slate-500 italic';
    empty.setAttribute('data-i18n', 'sections.historyEmpty');
    empty.textContent = t('sections.historyEmpty');
    container.appendChild(empty);
    return;
  }

  historyItems.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-arcade text-left px-3 py-2 rounded-lg bg-[#161925] hover:bg-[#1e2336] border border-[#252a3d] hover:border-cyan-500/50 text-xs flex items-center justify-between gap-2';
    btn.innerHTML = `
      <span class="truncate text-slate-200 font-medium">${item.label}</span>
      <span class="font-mono-tech text-[10px] text-cyan-400 uppercase shrink-0">${item.params.waveform}</span>
    `;
    btn.addEventListener('click', () => onSelect(item.params));
    container.appendChild(btn);
  });
}
