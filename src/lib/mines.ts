export const GRID_SIZE = 25;
const HOUSE_EDGE = 0.03;

/** Fair multiplier after revealing `gemsFound` safe tiles with `mineCount` mines in a 25-tile grid. */
export function minesMultiplier(mineCount: number, gemsFound: number): number {
  let fair = 1;
  for (let i = 0; i < gemsFound; i++) {
    fair *= (GRID_SIZE - i) / (GRID_SIZE - mineCount - i);
  }
  return fair * (1 - HOUSE_EDGE);
}

export function maxGems(mineCount: number): number {
  return GRID_SIZE - mineCount;
}
