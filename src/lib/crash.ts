const HOUSE_EDGE = 0.01;
const MIN_DURATION_S = 2.5;
const MAX_DURATION_S = 9;

/** Heavy-tailed crash point derived from a single fair float in [0, 1). */
export function crashPointFromFloat(f: number): number {
  if (f < HOUSE_EDGE) return 1.0;
  const raw = (1 / (1 - f)) * (1 - HOUSE_EDGE);
  return Math.max(1.0, Math.floor(raw * 100) / 100);
}

/**
 * Growth rate (per second, for multiplier = e^(growth * t)) tuned so this round's
 * animation always reaches its crash point within a bounded, watchable duration —
 * pure visual pacing, independent of the (already fair) crash point value itself.
 */
export function growthRateForRound(crashPoint: number): number {
  const duration = Math.min(MAX_DURATION_S, Math.max(MIN_DURATION_S, Math.log(crashPoint) * 1.3));
  return Math.log(crashPoint) / duration;
}

export function multiplierAtElapsed(seconds: number, growthPerSec: number): number {
  return Math.max(1, Math.exp(growthPerSec * seconds));
}
