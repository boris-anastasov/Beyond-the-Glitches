export function show(el) { el.classList.remove('hidden'); }
export function hide(el) { el.classList.add('hidden'); }
export function clearDialog(container) { container.innerHTML = ''; }
export function getSpeedLabel(val) {
  val = Number(val);
  if (val <= 15) return 'Fastest';
  if (val <= 25) return 'Faster';
  if (val <= 40) return 'Fast';
  if (val <= 60) return 'Medium';
  if (val <= 75) return 'Slow';
  if (val <= 90) return 'Slower';
  return 'Slowest';
} 