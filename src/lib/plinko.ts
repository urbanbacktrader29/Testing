export type Risk = "low" | "medium" | "high";

const TARGET_RTP = 0.97;
const RISK_EXPONENT: Record<Risk, number> = { low: 1.4, medium: 2.4, high: 4 };
const RISK_FLOOR: Record<Risk, number> = { low: 0.3, medium: 0.2, high: 0.1 };

function binomialProbabilities(rows: number): number[] {
  // C(rows, k) / 2^rows via a running ratio to avoid factorial overflow
  const probs: number[] = [1];
  for (let k = 1; k <= rows; k++) {
    probs.push((probs[k - 1] * (rows - k + 1)) / k);
  }
  const total = probs.reduce((a, b) => a + b, 0);
  return probs.map((p) => p / total);
}

/** Multiplier table for each bucket 0..rows, tuned so the binomial-weighted average pays out TARGET_RTP. */
export function buildMultiplierTable(rows: number, risk: Risk): number[] {
  const probs = binomialProbabilities(rows);
  const center = rows / 2;
  const exponent = RISK_EXPONENT[risk];
  const floor = RISK_FLOOR[risk];

  const shape = probs.map((_, k) => {
    const d = Math.abs(k - center) / center;
    return floor + (1 - floor) * Math.pow(d, exponent) * 12 + Math.pow(d, exponent * 2) * 4;
  });

  const weightedAvg = shape.reduce((sum, m, k) => sum + m * probs[k], 0);
  const scale = TARGET_RTP / weightedAvg;

  return shape.map((m) => Math.round(m * scale * 100) / 100);
}

export function bucketColor(rows: number, k: number): string {
  const d = Math.abs(k - rows / 2) / (rows / 2);
  if (d > 0.75) return "bg-rose-500";
  if (d > 0.4) return "bg-orange-400";
  if (d > 0.15) return "bg-amber-300";
  return "bg-emerald-400";
}
