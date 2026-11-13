export function drawWaveform(canvas, buffer) {
  if (!canvas || !buffer) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  if (rect.width === 0 || rect.height === 0) return;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;

  ctx.clearRect(0, 0, w, h);

  // Center axis
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  // Waveform trace
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(0, 240, 255, 0.7)';
  ctx.shadowBlur = 8;
  ctx.beginPath();

  const step = Math.max(1, Math.floor(buffer.length / w));
  for (let x = 0; x < w; x++) {
    const idx = Math.min(buffer.length - 1, Math.floor((x / w) * buffer.length));
    let min = 1;
    let max = -1;
    for (let j = 0; j < step && idx + j < buffer.length; j++) {
      const v = buffer[idx + j];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const y = h / 2 - ((min + max) / 2) * (h * 0.42);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}
