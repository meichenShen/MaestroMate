export interface SpringState {
  value: number;
  velocity: number;
}
// Exact damped spring solution: frame-rate independent, bounded after pauses.
export function springStep(
  state: SpringState,
  target: number,
  seconds: number,
): SpringState {
  const t = Number.isFinite(target) ? Math.max(-1, Math.min(1, target)) : 0;
  const x = (Number.isFinite(state.value) ? state.value : 0) - t;
  const v = Number.isFinite(state.velocity) ? state.velocity : 0;
  const dt = Number.isFinite(seconds)
    ? Math.max(0, Math.min(0.05, seconds))
    : 0;
  const damping = 10,
    frequency = 14,
    decay = Math.exp(-damping * dt),
    c = Math.cos(frequency * dt),
    s = Math.sin(frequency * dt),
    b = (v + damping * x) / frequency;
  return {
    value: t + decay * (x * c + b * s),
    velocity:
      decay *
      ((-damping * x + b * frequency) * c + (-damping * b - x * frequency) * s),
  };
}
