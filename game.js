'use strict';

/* =========================================================
   IDLE MINING TYCOON — Configuration
   ========================================================= */

const MAX_FLOORS = 6;
const STARTING_FLOORS = 3;
const FLOOR_BUFFER_SECONDS = 90;      // how many seconds of production a floor can hold before it stalls
const SAVE_KEY = 'idleMiningTycoon_save_v1';
const TUTORIAL_KEY = 'idleMiningTycoon_tutorial_seen';
const AUTOSAVE_MS = 10000;
const TICK_MS = 100;
const BASE_OFFLINE_CAP_SECONDS = 8 * 3600; // max 8h of offline production simulated (skill can extend)
const PRESTIGE_DIVISOR = 5e7;         // tune how fast prestige points accumulate
const PRESTIGE_BONUS_PER_POINT = 0.02; // +2% production per investor

const FRENZY_DECAY_PER_SEC = 14;
const FRENZY_PER_CLICK = 20;
const FRENZY_PER_COLLECT_ALL = 6;
const BASE_GOLDRUSH_DURATION = 12;    // seconds
const BASE_GOLDRUSH_MULTIPLIER = 3;

const EVENT_MULTIPLIER = 5;
const EVENT_DURATION_MS = 20000;
const EVENT_CHANCE_PER_SEC = 0.012;

const BONUS_CHEST_ACTIVE_MS = 5 * 60 * 1000;
const BONUS_CHEST_COOLDOWN_MS = 10 * 60 * 1000;
const BONUS_CHEST_MULTIPLIER = 2;

const RELIC_DROP_CHANCE = 0.03;

const MINES = [
  { id: 'copper',  name: 'Kupfermine',      icon: '⛏️', unlockCost: 0,             oreValue: 1,     floorBaseRate: 0.5,  floorCostBase: 10,     elevatorBaseThroughput: 5,    elevatorCostBase: 100,    theme: ['#d97b3f', '#f4c04d'] },
  { id: 'silver',  name: 'Silbermine',      icon: '🪨', unlockCost: 75000,         oreValue: 5,     floorBaseRate: 2,    floorCostBase: 60,     elevatorBaseThroughput: 15,   elevatorCostBase: 800,    theme: ['#8fa3b0', '#e8eef2'] },
  { id: 'gold',    name: 'Goldmine',        icon: '🥇', unlockCost: 3000000,       oreValue: 25,    floorBaseRate: 8,    floorCostBase: 400,    elevatorBaseThroughput: 50,   elevatorCostBase: 6000,   theme: ['#f4c04d', '#fff2b0'] },
  { id: 'diamond', name: 'Diamantmine',     icon: '💎', unlockCost: 150000000,     oreValue: 120,   floorBaseRate: 30,   floorCostBase: 3000,   elevatorBaseThroughput: 180,  elevatorCostBase: 45000,  theme: ['#5aa9e0', '#c9f0ff'] },
  { id: 'oil',     name: 'Ölfeld',          icon: '🛢️', unlockCost: 8000000000,    oreValue: 600,   floorBaseRate: 100,  floorCostBase: 20000,  elevatorBaseThroughput: 600,  elevatorCostBase: 300000, theme: ['#5c5c5c', '#a3833f'] },
  { id: 'crystal', name: 'Kristallmine',    icon: '🔮', unlockCost: 400000000000, oreValue: 3000,  floorBaseRate: 350,  floorCostBase: 150000, elevatorBaseThroughput: 2000, elevatorCostBase: 2000000, theme: ['#b06fe0', '#f0c9ff'] },
  { id: 'uranium', name: 'Uranmine',        icon: '☢️', unlockCost: 2e13,          oreValue: 15000, floorBaseRate: 1300, floorCostBase: 1.05e6, elevatorBaseThroughput: 6600, elevatorCostBase: 1.4e7,   theme: ['#6fcf6f', '#d4ff8f'] },
  { id: 'titanium',name: 'Titanmine',       icon: '🛰️', unlockCost: 1e15,          oreValue: 75000, floorBaseRate: 4800, floorCostBase: 7.35e6, elevatorBaseThroughput: 21800, elevatorCostBase: 9.8e7,  theme: ['#7a8ba0', '#cfd8e3'] },
  { id: 'asteroid',name: 'Asteroidengürtel',icon: '☄️', unlockCost: 5e16,          oreValue: 375000, floorBaseRate: 17800, floorCostBase: 5.15e7, elevatorBaseThroughput: 71900, elevatorCostBase: 6.86e8, theme: ['#3a2e5c', '#8a7fd0'] },
];

const FLOOR_ICONS = ['⛏️', '🔨', '🧨', '🚂', '🔦', '⚒️'];

/* =========================================================
   Skills (Talente) — permanent, bought with skill points earned via prestige
   ========================================================= */

const SKILLS = [
  { id: 'production_boost',   icon: '⚡', name: 'Effizientere Förderung', desc: '+20% Produktion auf allen Schächten', cost: 1 },
  { id: 'cheap_upgrades',     icon: '🔧', name: 'Massenrabatt',           desc: '-10% Kosten für Schacht-Upgrades', cost: 1 },
  { id: 'cheap_managers',     icon: '💼', name: 'Gutes Recruiting',       desc: '-15% Kosten für Manager', cost: 1 },
  { id: 'elevator_boost',     icon: '🛗', name: 'Geölte Seile',           desc: '+10% Aufzug-Durchsatz', cost: 2 },
  { id: 'goldrush_duration',  icon: '⏱️', name: 'Ausdauer',               desc: 'Goldrausch dauert 5s länger', cost: 2 },
  { id: 'goldrush_power',     icon: '🔥', name: 'Rausch-Verstärker',      desc: 'Goldrausch-Multiplikator +1', cost: 3 },
  { id: 'offline_cap',        icon: '🌙', name: 'Nachtschicht',           desc: '+4h maximale Offline-Zeit', cost: 2 },
  { id: 'prestige_headstart', icon: '🚀', name: 'Kopfstart',              desc: '+$500 Startkapital nach Prestige', cost: 2 },
  { id: 'quest_reward_boost', icon: '📜', name: 'Fleißbonus',             desc: '+50% Quest-Belohnungen', cost: 2 },
  { id: 'relic_luck',         icon: '🍀', name: 'Glückspilz',             desc: '+50% Chance auf Relikt-Funde', cost: 3 },
];

/* =========================================================
   Achievements
   ========================================================= */

const ACHIEVEMENTS = [
  { id: 'first_collect', icon: '🖐️', name: 'Erste Schaufel', desc: 'Sammle zum ersten Mal manuell Erz ein', check: s => s.stats.totalManualCollects >= 1 },
  { id: 'collect_100', icon: '💪', name: 'Fleißige Hände', desc: 'Sammle 100x manuell ein', check: s => s.stats.totalManualCollects >= 100 },
  { id: 'first_manager', icon: '🤖', name: 'Erster Angestellter', desc: 'Stelle deinen ersten Manager ein', check: s => s.stats.totalManagersHired >= 1 },
  { id: 'managers_10', icon: '👔', name: 'Personalchef', desc: 'Stelle 10 Manager ein', check: s => s.stats.totalManagersHired >= 10 },
  { id: 'first_upgrade', icon: '⬆️', name: 'Erstes Upgrade', desc: 'Verbessere einen Schacht', check: s => s.stats.totalUpgradesBought >= 1 },
  { id: 'upgrades_100', icon: '🏗️', name: 'Ausbau-Experte', desc: 'Kaufe 100 Schacht-Upgrades', check: s => s.stats.totalUpgradesBought >= 100 },
  { id: 'floor_level_25', icon: '📈', name: 'Tiefenrausch', desc: 'Bringe einen Schacht auf Level 25', check: s => s.mines.some(m => m.floors.some(f => f.level >= 25)) },
  { id: 'floor_level_50', icon: '🕳️', name: 'Bohrmeister', desc: 'Bringe einen Schacht auf Level 50', check: s => s.mines.some(m => m.floors.some(f => f.level >= 50)) },
  { id: 'mine_unlocked_2', icon: '🗺️', name: 'Expansion', desc: 'Schalte 2 Minen frei', check: s => s.mines.filter(m => m.unlocked).length >= 2 },
  { id: 'mine_unlocked_5', icon: '🌍', name: 'Imperium', desc: 'Schalte 5 Minen frei', check: s => s.mines.filter(m => m.unlocked).length >= 5 },
  { id: 'all_mines', icon: '👑', name: 'Vollständige Kontrolle', desc: 'Schalte alle Minen frei', check: s => s.mines.every(m => m.unlocked) },
  { id: 'all_floors_one_mine', icon: '🏛️', name: 'Vollausbau', desc: 'Schalte alle Schächte einer Mine frei', check: s => s.mines.some(m => m.floors.every(f => f.unlocked)) },
  { id: 'lifetime_1k', icon: '🪙', name: 'Taschengeld', desc: 'Verdiene insgesamt $1.000', check: s => s.lifetimeCashEarned >= 1e3 },
  { id: 'lifetime_1m', icon: '💰', name: 'Millionär', desc: 'Verdiene insgesamt $1 Million', check: s => s.lifetimeCashEarned >= 1e6 },
  { id: 'lifetime_1b', icon: '🏦', name: 'Milliardär', desc: 'Verdiene insgesamt $1 Milliarde', check: s => s.lifetimeCashEarned >= 1e9 },
  { id: 'lifetime_1t', icon: '🌌', name: 'Jenseits der Vorstellung', desc: 'Verdiene insgesamt $1 Billion', check: s => s.lifetimeCashEarned >= 1e12 },
  { id: 'first_prestige', icon: '💼', name: 'Neuanfang', desc: 'Führe deinen ersten Prestige-Reset durch', check: s => s.prestigeCount >= 1 },
  { id: 'prestige_10', icon: '🔁', name: 'Seriengründer', desc: '10x Prestige durchgeführt', check: s => s.prestigeCount >= 10 },
  { id: 'goldrush_1', icon: '⚡', name: 'Goldfieber', desc: 'Löse den Goldrausch aus', check: s => s.stats.goldrushesTriggered >= 1 },
  { id: 'goldrush_10', icon: '🌟', name: 'Goldrausch-Profi', desc: '10x Goldrausch ausgelöst', check: s => s.stats.goldrushesTriggered >= 10 },
  { id: 'relic_1', icon: '💎', name: 'Entdecker', desc: 'Finde dein erstes Relikt', check: s => s.relicsFound.length >= 1 },
  { id: 'relic_all', icon: '🏺', name: 'Sammler', desc: 'Finde alle Relikte', check: s => s.relicsFound.length >= RELICS.length },
  { id: 'streak_7', icon: '📅', name: 'Wochentreue', desc: '7 Tage in Folge eingeloggt', check: s => s.loginStreak >= 7 },
  { id: 'elevator_10', icon: '🛗', name: 'Schnellaufzug', desc: 'Bringe einen Aufzug auf Level 10', check: s => s.mines.some(m => m.elevatorLevel >= 10) },
];

/* =========================================================
   Relics (Sammlung)
   ========================================================= */

const RELICS = [
  { id: 'lucky_pick', icon: '⛏️', name: 'Glücksspitzhacke', desc: 'Eine abgenutzte, aber treue Spitzhacke.' },
  { id: 'golden_nugget', icon: '🪙', name: 'Goldener Klumpen', desc: 'Glänzt heller als alles andere im Stollen.' },
  { id: 'ancient_map', icon: '🗺️', name: 'Alte Schatzkarte', desc: 'Führte einst zu einer vergessenen Ader.' },
  { id: 'crystal_shard', icon: '🔮', name: 'Kristallsplitter', desc: 'Summt leise, wenn man genau hinhört.' },
  { id: 'fossil', icon: '🦴', name: 'Fossil', desc: 'Millionen Jahre alt, perfekt erhalten.' },
  { id: 'rusty_lamp', icon: '🏮', name: 'Rostige Grubenlampe', desc: 'Brennt noch immer schwach.' },
  { id: 'meteor_fragment', icon: '☄️', name: 'Meteoritensplitter', desc: 'Eiskalt, obwohl er glüht.' },
  { id: 'engraved_coin', icon: '🪙', name: 'Gravierte Münze', desc: 'Eine Inschrift in unbekannter Sprache.' },
];

/* =========================================================
   Quests
   ========================================================= */

const QUEST_DEFS = {
  manual_collects: { icon: '🖐️', desc: t => `Sammle ${t}x manuell Erz ein` },
  upgrades: { icon: '⬆️', desc: t => `Kaufe ${t} Schacht-Upgrades` },
  managers: { icon: '🤖', desc: t => `Stelle ${t} neue Manager ein` },
  earn_cash: { icon: '💰', desc: t => `Verdiene $${formatNumber(t)}` },
  goldrush: { icon: '🔥', desc: t => `Löse ${t}x den Goldrausch aus` },
};
const QUEST_TARGETS = { manual_collects: 15, upgrades: 8, managers: 2, goldrush: 1 };

/* =========================================================
   Formulas
   ========================================================= */

function isWeekend() {
  const d = new Date().getDay();
  return d === 0 || d === 6;
}

function hasSkill(id) {
  return !!(state && state.skillsBought && state.skillsBought.includes(id));
}

function prestigeMultiplier() {
  return 1 + state.prestigePoints * PRESTIGE_BONUS_PER_POINT;
}

function frenzyMultiplier() {
  return goldrushActive ? (BASE_GOLDRUSH_MULTIPLIER + (hasSkill('goldrush_power') ? 1 : 0)) : 1;
}

function weekendMultiplier() {
  return isWeekend() ? 1.1 : 1;
}

function skillProductionMultiplier() {
  return hasSkill('production_boost') ? 1.2 : 1;
}

function achievementMultiplier() {
  return 1 + (state.achievementsUnlocked ? state.achievementsUnlocked.length : 0) * 0.004;
}

function relicMultiplier() {
  return 1 + (state.relicsFound ? state.relicsFound.length : 0) * 0.003;
}

function bonusChestMultiplier() {
  return (state.bonusChest && Date.now() < state.bonusChest.activeUntil) ? BONUS_CHEST_MULTIPLIER : 1;
}

function globalMultiplier() {
  return prestigeMultiplier() * frenzyMultiplier() * weekendMultiplier() * skillProductionMultiplier() * achievementMultiplier() * relicMultiplier() * bonusChestMultiplier();
}

function floorEventMultiplier(mineIdx, floorIdx) {
  const ev = activeEvents[mineIdx + '-' + floorIdx];
  if (ev && ev.until > Date.now()) return EVENT_MULTIPLIER;
  return 1;
}

function floorRate(mineIdx, floorIdx, level) {
  const cfg = MINES[mineIdx];
  const base = cfg.floorBaseRate * (1 + floorIdx * 0.6);
  return base * level * globalMultiplier() * floorEventMultiplier(mineIdx, floorIdx);
}

function floorCapacity(mineIdx, floorIdx, level) {
  return floorRate(mineIdx, floorIdx, level) * FLOOR_BUFFER_SECONDS;
}

function floorUpgradeCost(mineIdx, floorIdx, level) {
  const cfg = MINES[mineIdx];
  const base = cfg.floorCostBase * (1 + floorIdx * 0.8);
  const discount = hasSkill('cheap_upgrades') ? 0.9 : 1;
  return Math.ceil(base * Math.pow(1.15, level - 1) * discount);
}

function floorManagerCost(mineIdx, floorIdx) {
  const cfg = MINES[mineIdx];
  const discount = hasSkill('cheap_managers') ? 0.85 : 1;
  return Math.ceil(cfg.floorCostBase * (1 + floorIdx) * 40 * discount);
}

function floorUnlockCost(mineIdx, floorIdx) {
  const cfg = MINES[mineIdx];
  return Math.ceil(cfg.floorCostBase * Math.pow(6, floorIdx));
}

function elevatorThroughput(mineIdx, level) {
  const cfg = MINES[mineIdx];
  const boost = hasSkill('elevator_boost') ? 1.1 : 1;
  return cfg.elevatorBaseThroughput * (1 + 0.25 * (level - 1)) * boost;
}

function elevatorUpgradeCost(mineIdx, level) {
  const cfg = MINES[mineIdx];
  return Math.ceil(cfg.elevatorCostBase * Math.pow(1.28, level - 1));
}

function potentialPrestigeGain() {
  return Math.floor(Math.sqrt(Math.max(0, state.runCashEarned) / PRESTIGE_DIVISOR));
}

function offlineCapSeconds() {
  return BASE_OFFLINE_CAP_SECONDS + (hasSkill('offline_cap') ? 4 * 3600 : 0);
}

function foremanCost(mineIdx) {
  const mine = state.mines[mineIdx];
  let unmanagedSum = 0;
  let anyUnlocked = false;
  mine.floors.forEach((f, fi) => {
    if (f.unlocked) {
      anyUnlocked = true;
      if (!f.manager) unmanagedSum += floorManagerCost(mineIdx, fi);
    }
  });
  if (unmanagedSum <= 0) {
    return Math.ceil(floorManagerCost(mineIdx, MAX_FLOORS - 1) * (anyUnlocked ? 1.2 : 1));
  }
  return Math.ceil(unmanagedSum * 0.7);
}

/* =========================================================
   State
   ========================================================= */

let state = null;
let activeEvents = {}; // runtime-only: "mineIdx-floorIdx" -> { until }
let cashHistory = [];  // runtime-only sparkline samples: { t, cash }

function freshMineState(mineIdx) {
  const floors = [];
  for (let f = 0; f < MAX_FLOORS; f++) {
    floors.push({
      unlocked: f < STARTING_FLOORS,
      level: 1,
      manager: false,
      buffer: 0,
    });
  }
  return {
    unlocked: mineIdx === 0,
    elevatorLevel: 1,
    elevatorQueue: 0,
    foreman: false,
    floors,
  };
}

function freshStats() {
  return {
    totalManualCollects: 0,
    totalUpgradesBought: 0,
    totalManagersHired: 0,
    goldrushesTriggered: 0,
    playSeconds: 0,
  };
}

function freshState() {
  return {
    cash: 50,
    lifetimeCashEarned: 50,
    runCashEarned: 0,
    prestigePoints: 0,
    prestigeCount: 0,
    activeMineIndex: 0,
    lastSave: Date.now(),
    mines: MINES.map((_, i) => freshMineState(i)),
    skillPoints: 0,
    skillsBought: [],
    achievementsUnlocked: [],
    relicsFound: [],
    stats: freshStats(),
    dailyQuests: null,
    lastLoginDate: null,
    loginStreak: 0,
    bonusChest: { activeUntil: 0, readyAt: 0 },
    settings: { soundEnabled: true, performanceMode: false, theme: 'dark', autoBuyEnabled: false, showMascot: true },
  };
}

function addCash(amount) {
  state.cash += amount;
  state.lifetimeCashEarned += amount;
  state.runCashEarned += amount;
  bumpQuestProgress('earn_cash', amount);
}

/* =========================================================
   Save / Load / Offline earnings
   ========================================================= */

function save() {
  state.lastSave = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  flashSaved();
}

function applyLoadedState(loaded) {
  const base = freshState();
  state = Object.assign(base, loaded);
  state.mines = MINES.map((_, i) => {
    const savedMine = loaded.mines && loaded.mines[i];
    const freshMine = freshMineState(i);
    if (!savedMine) return freshMine;
    const merged = Object.assign(freshMine, savedMine);
    merged.floors = freshMine.floors.map((f, fi) => Object.assign(f, (savedMine.floors && savedMine.floors[fi]) || {}));
    return merged;
  });
  state.stats = Object.assign(freshStats(), loaded.stats || {});
  state.settings = Object.assign(freshState().settings, loaded.settings || {});
  state.bonusChest = Object.assign({ activeUntil: 0, readyAt: 0 }, loaded.bonusChest || {});
  state.skillsBought = Array.isArray(loaded.skillsBought) ? loaded.skillsBought : [];
  state.achievementsUnlocked = Array.isArray(loaded.achievementsUnlocked) ? loaded.achievementsUnlocked : [];
  state.relicsFound = Array.isArray(loaded.relicsFound) ? loaded.relicsFound : [];
}

function load() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    state = freshState();
    return;
  }
  try {
    applyLoadedState(JSON.parse(raw));
  } catch (e) {
    console.error('Save corrupted, starting fresh', e);
    state = freshState();
  }
}

function simulateOffline(elapsedSeconds) {
  const capped = Math.min(elapsedSeconds, offlineCapSeconds());
  if (capped < 5) return 0;
  let totalEarned = 0;

  state.mines.forEach((mine, mineIdx) => {
    if (!mine.unlocked) return;
    let managedRate = 0;
    mine.floors.forEach((floor, floorIdx) => {
      if (floor.unlocked && floor.manager) {
        managedRate += floorRate(mineIdx, floorIdx, floor.level);
      }
    });
    if (managedRate <= 0) return;
    const throughput = elevatorThroughput(mineIdx, mine.elevatorLevel);
    const effectiveOreRate = Math.min(managedRate, throughput);
    const oreValue = MINES[mineIdx].oreValue;
    totalEarned += effectiveOreRate * oreValue * capped;
  });

  return totalEarned;
}

/* =========================================================
   Game tick
   ========================================================= */

function tick(dtSeconds) {
  state.mines.forEach((mine, mineIdx) => {
    if (!mine.unlocked) return;
    const throughput = elevatorThroughput(mineIdx, mine.elevatorLevel);

    mine.floors.forEach((floor, floorIdx) => {
      if (!floor.unlocked) return;
      const rate = floorRate(mineIdx, floorIdx, floor.level);
      const capacity = floorCapacity(mineIdx, floorIdx, floor.level);
      floor.buffer = Math.min(capacity, floor.buffer + rate * dtSeconds);

      if (floor.manager && floor.buffer > 0) {
        mine.elevatorQueue += floor.buffer;
        floor.buffer = 0;
      }
    });

    if (mine.elevatorQueue > 0) {
      const moved = Math.min(mine.elevatorQueue, throughput * dtSeconds);
      mine.elevatorQueue -= moved;
      addCash(moved * MINES[mineIdx].oreValue);
    }
  });

  state.stats.playSeconds += dtSeconds;
}

/* =========================================================
   Derived stats for UI
   ========================================================= */

function mineCashPerSecond(mineIdx) {
  const mine = state.mines[mineIdx];
  if (!mine.unlocked) return 0;
  let managedRate = 0;
  mine.floors.forEach((floor, floorIdx) => {
    if (floor.unlocked && floor.manager) {
      managedRate += floorRate(mineIdx, floorIdx, floor.level);
    }
  });
  const throughput = elevatorThroughput(mineIdx, mine.elevatorLevel);
  const effective = Math.min(managedRate, throughput);
  return effective * MINES[mineIdx].oreValue;
}

function totalCashPerSecond() {
  let total = 0;
  state.mines.forEach((m, i) => { total += mineCashPerSecond(i); });
  return total;
}

/* =========================================================
   Formatting
   ========================================================= */

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

function formatNumber(n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  const sign = n < 0 ? '-' : '';
  n = Math.abs(n);
  if (n < 1000) return sign + (Number.isInteger(n) ? n : n.toFixed(1));
  let tier = 0;
  while (n >= 1000 && tier < SUFFIXES.length - 1) {
    n /= 1000;
    tier++;
  }
  return sign + n.toFixed(2) + SUFFIXES[tier];
}

function formatCash(n) { return '$' + formatNumber(n); }

function formatDuration(totalSeconds) {
  const s = Math.floor(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

/* =========================================================
   Rendering — core game view
   ========================================================= */

const el = {
  cash: document.getElementById('cash-display'),
  cps: document.getElementById('cps-display'),
  prestige: document.getElementById('prestige-display'),
  tabs: document.getElementById('mine-tabs'),
  mineTitle: document.getElementById('mine-title'),
  floorsList: document.getElementById('floors-list'),
  unlockFloorRow: document.getElementById('unlock-floor-row'),
  collectAllBtn: document.getElementById('collect-all-btn'),
  foremanBtn: document.getElementById('foreman-btn'),
  elevatorFill: document.getElementById('elevator-fill'),
  elevatorThroughput: document.getElementById('elevator-throughput'),
  elevatorQueue: document.getElementById('elevator-queue'),
  elevatorUpgradeBtn: document.getElementById('elevator-upgrade-btn'),
  mineCps: document.getElementById('mine-cps'),
  saveIndicator: document.getElementById('save-indicator'),
  floatLayer: document.getElementById('float-layer'),
  weekendBadge: document.getElementById('weekend-badge'),
};

function renderTopbar() {
  el.cash.textContent = formatCash(state.cash);
  el.cps.textContent = formatCash(totalCashPerSecond()) + '/s';
  const bonusPct = Math.round((prestigeMultiplier() - 1) * 100);
  el.prestige.textContent = `${state.prestigePoints} (+${bonusPct}%)`;
  el.weekendBadge.classList.toggle('hidden', !isWeekend());
}

function applyMineTheme(mineIdx) {
  const theme = MINES[mineIdx].theme;
  document.documentElement.style.setProperty('--mine-accent-a', theme[0]);
  document.documentElement.style.setProperty('--mine-accent-b', theme[1]);
}

function renderTabs() {
  el.tabs.innerHTML = '';
  MINES.forEach((cfg, i) => {
    const mine = state.mines[i];
    const tab = document.createElement('button');
    tab.className = 'mine-tab' + (i === state.activeMineIndex ? ' active' : '') + (!mine.unlocked ? ' locked' : '');
    if (mine.unlocked) {
      tab.innerHTML = `${cfg.icon} ${cfg.name}<span class="tab-cps">${formatCash(mineCashPerSecond(i))}/s</span>`;
      tab.addEventListener('click', () => { state.activeMineIndex = i; applyMineTheme(i); renderAll(); });
    } else {
      tab.innerHTML = `🔒 ${cfg.name}<span class="tab-cps">${formatCash(cfg.unlockCost)}</span>`;
      if (state.cash >= cfg.unlockCost) tab.classList.add('ready-pulse');
      tab.addEventListener('click', (ev) => tryUnlockMine(i, ev));
    }
    el.tabs.appendChild(tab);
  });
}

function tryUnlockMine(i, ev) {
  const cfg = MINES[i];
  const mine = state.mines[i];
  if (mine.unlocked) return;
  if (state.cash < cfg.unlockCost) {
    shake(el.tabs);
    return;
  }
  state.cash -= cfg.unlockCost;
  mine.unlocked = true;
  state.activeMineIndex = i;
  applyMineTheme(i);
  spawnConfetti(70);
  screenShake();
  sfxBuy();
  mascotReact();
  checkAchievements();
  renderAll();
}

function renderFloors() {
  const mineIdx = state.activeMineIndex;
  const cfg = MINES[mineIdx];
  const mine = state.mines[mineIdx];
  el.mineTitle.textContent = `${cfg.icon} ${cfg.name}`;
  el.floorsList.innerHTML = '';

  let nextLockedIndex = -1;

  mine.floors.forEach((floor, floorIdx) => {
    if (!floor.unlocked) {
      if (nextLockedIndex === -1) nextLockedIndex = floorIdx;
      return;
    }
    const rate = floorRate(mineIdx, floorIdx, floor.level);
    const capacity = floorCapacity(mineIdx, floorIdx, floor.level);
    const fillPct = capacity > 0 ? Math.min(100, (floor.buffer / capacity) * 100) : 0;
    const upgradeCost = floorUpgradeCost(mineIdx, floorIdx, floor.level);
    const eventOn = floorEventMultiplier(mineIdx, floorIdx) > 1;

    const row = document.createElement('div');
    row.className = 'floor-row' + (floor.manager ? ' managed' : '') + (eventOn ? ' event-active' : '');

    const isWarn = !floor.manager && fillPct >= 85;
    const barClass = 'floor-bar' + (floor.manager ? ' managed' : '') + (isWarn ? ' warn' : '');

    row.innerHTML = `
      <div class="floor-icon">${FLOOR_ICONS[floorIdx % FLOOR_ICONS.length]}</div>
      <div class="floor-main">
        <div class="floor-name-row">
          <b>Schacht ${floorIdx + 1} · Lv.${floor.level}</b>
          <span>${eventOn ? '<span class="event-badge">⚡5x</span> ' : ''}${formatNumber(rate)} Erz/s</span>
        </div>
        <div class="${barClass}" data-collect="${floorIdx}" title="Klicken zum Einsammeln">
          <div class="floor-bar-fill" style="width:${fillPct}%"></div>
        </div>
      </div>
      <div class="floor-actions">
        <button class="btn btn-primary btn-small" data-upgrade="${floorIdx}">⬆️ Upgrade<br>${formatCash(upgradeCost)}</button>
        ${floor.manager
          ? `<div class="manager-badge">🤖 Manager aktiv</div>`
          : `<button class="btn btn-small" data-manager="${floorIdx}">🤖 Manager<br>${formatCash(floorManagerCost(mineIdx, floorIdx))}</button>`}
      </div>
    `;
    el.floorsList.appendChild(row);
  });

  el.floorsList.querySelectorAll('[data-upgrade]').forEach(btn => {
    const fi = parseInt(btn.getAttribute('data-upgrade'), 10);
    const cost = floorUpgradeCost(mineIdx, fi, mine.floors[fi].level);
    btn.disabled = state.cash < cost;
    if (!btn.disabled) btn.classList.add('ready-pulse');
    btn.addEventListener('click', (ev) => upgradeFloor(mineIdx, fi, ev));
  });
  el.floorsList.querySelectorAll('[data-manager]').forEach(btn => {
    const fi = parseInt(btn.getAttribute('data-manager'), 10);
    const cost = floorManagerCost(mineIdx, fi);
    btn.disabled = state.cash < cost;
    if (!btn.disabled) btn.classList.add('ready-pulse');
    btn.addEventListener('click', (ev) => buyManager(mineIdx, fi, ev));
  });
  el.floorsList.querySelectorAll('[data-collect]').forEach(bar => {
    const fi = parseInt(bar.getAttribute('data-collect'), 10);
    bar.addEventListener('click', (ev) => collectFloor(mineIdx, fi, ev));
  });

  el.unlockFloorRow.innerHTML = '';
  if (nextLockedIndex !== -1) {
    const cost = floorUnlockCost(mineIdx, nextLockedIndex);
    const row = document.createElement('div');
    row.className = 'floor-locked';
    const affordable = state.cash >= cost;
    row.innerHTML = `
      <span>🔒 Neuer Schacht ${nextLockedIndex + 1} freischalten</span>
      <button class="btn btn-primary btn-small${affordable ? ' ready-pulse' : ''}" ${affordable ? '' : 'disabled'}>${formatCash(cost)}</button>
    `;
    row.querySelector('button').addEventListener('click', (ev) => unlockFloor(mineIdx, nextLockedIndex, ev));
    el.unlockFloorRow.appendChild(row);
  }

  const fCost = foremanCost(mineIdx);
  if (mine.foreman) {
    el.foremanBtn.textContent = '👷 Vorarbeiter aktiv ✓';
    el.foremanBtn.disabled = true;
    el.foremanBtn.classList.remove('ready-pulse');
  } else {
    el.foremanBtn.innerHTML = `👷 Vorarbeiter (${formatCash(fCost)})`;
    el.foremanBtn.disabled = state.cash < fCost;
    el.foremanBtn.classList.toggle('ready-pulse', !el.foremanBtn.disabled);
  }
}

function renderElevator() {
  const mineIdx = state.activeMineIndex;
  const mine = state.mines[mineIdx];
  const throughput = elevatorThroughput(mineIdx, mine.elevatorLevel);
  const cap = throughput * 20;
  const pct = cap > 0 ? Math.min(100, (mine.elevatorQueue / cap) * 100) : 0;
  el.elevatorFill.style.height = pct + '%';
  el.elevatorThroughput.textContent = formatNumber(throughput);
  el.elevatorQueue.textContent = formatNumber(mine.elevatorQueue);

  const upgradeCost = elevatorUpgradeCost(mineIdx, mine.elevatorLevel);
  el.elevatorUpgradeBtn.textContent = `⬆️ Aufzug Lv.${mine.elevatorLevel} → ${mine.elevatorLevel + 1} (${formatCash(upgradeCost)})`;
  el.elevatorUpgradeBtn.disabled = state.cash < upgradeCost;
  el.elevatorUpgradeBtn.classList.toggle('ready-pulse', !el.elevatorUpgradeBtn.disabled);
  el.elevatorUpgradeBtn.onclick = (ev) => upgradeElevator(mineIdx, ev);

  el.mineCps.textContent = formatCash(mineCashPerSecond(mineIdx)) + '/s';
}

function renderAll() {
  renderTopbar();
  renderTabs();
  renderFloors();
  renderElevator();
  renderBonusChestButton();
}

/* =========================================================
   Core actions
   ========================================================= */

function upgradeFloor(mineIdx, floorIdx, ev) {
  const mine = state.mines[mineIdx];
  const floor = mine.floors[floorIdx];
  const cost = floorUpgradeCost(mineIdx, floorIdx, floor.level);
  if (state.cash < cost) { shake(ev.currentTarget); return; }
  state.cash -= cost;
  floor.level++;
  state.stats.totalUpgradesBought++;
  bumpQuestProgress('upgrades', 1);
  addRipple(ev.currentTarget, ev);
  spawnOreParticles(ev.clientX, ev.clientY, 5);
  sfxBuy();
  if (floor.level % 10 === 0) { spawnConfetti(24); screenShake(); }
  checkAchievements();
  renderAll();
}

function buyManager(mineIdx, floorIdx, ev) {
  const mine = state.mines[mineIdx];
  const floor = mine.floors[floorIdx];
  if (floor.manager) return;
  const cost = floorManagerCost(mineIdx, floorIdx);
  if (state.cash < cost) { shake(ev.currentTarget); return; }
  state.cash -= cost;
  floor.manager = true;
  state.stats.totalManagersHired++;
  bumpQuestProgress('managers', 1);
  addRipple(ev.currentTarget, ev);
  spawnConfetti(20);
  sfxBuy();
  checkAchievements();
  renderAll();
}

function unlockFloor(mineIdx, floorIdx, ev) {
  const mine = state.mines[mineIdx];
  const cost = floorUnlockCost(mineIdx, floorIdx);
  if (state.cash < cost) return;
  state.cash -= cost;
  mine.floors[floorIdx].unlocked = true;
  if (mine.foreman) mine.floors[floorIdx].manager = true;
  if (ev) addRipple(ev.currentTarget, ev);
  spawnConfetti(26);
  screenShake();
  sfxBuy();
  checkAchievements();
  renderAll();
}

function upgradeElevator(mineIdx, ev) {
  const mine = state.mines[mineIdx];
  const cost = elevatorUpgradeCost(mineIdx, mine.elevatorLevel);
  if (state.cash < cost) return;
  state.cash -= cost;
  mine.elevatorLevel++;
  if (ev) {
    addRipple(el.elevatorUpgradeBtn, ev);
    spawnOreParticles(ev.clientX, ev.clientY, 8);
  }
  sfxBuy();
  if (mine.elevatorLevel % 5 === 0) { spawnConfetti(24); screenShake(); }
  checkAchievements();
  renderAll();
}

function hireForeman(mineIdx, ev) {
  const mine = state.mines[mineIdx];
  if (mine.foreman) return;
  const cost = foremanCost(mineIdx);
  if (state.cash < cost) { shake(ev.currentTarget); return; }
  state.cash -= cost;
  mine.foreman = true;
  mine.floors.forEach(f => { if (f.unlocked) f.manager = true; });
  addRipple(ev.currentTarget, ev);
  spawnConfetti(40);
  screenShake();
  sfxBuy();
  mascotReact();
  checkAchievements();
  renderAll();
}

function collectFloor(mineIdx, floorIdx, ev) {
  const mine = state.mines[mineIdx];
  const floor = mine.floors[floorIdx];
  if (floor.manager) return;
  if (floor.buffer <= 0) return;
  mine.elevatorQueue += floor.buffer;
  spawnFloatText(ev.clientX, ev.clientY, `+${formatNumber(floor.buffer)} Erz`);
  spawnOreParticles(ev.clientX, ev.clientY, 6 + Math.floor(Math.random() * 4));
  popCash();
  sfxCollect();
  addFrenzy(FRENZY_PER_CLICK);
  state.stats.totalManualCollects++;
  bumpQuestProgress('manual_collects', 1);
  maybeDropRelic();
  floor.buffer = 0;
  checkAchievements();
  renderAll();
}

function collectAll(ev) {
  const mineIdx = state.activeMineIndex;
  const mine = state.mines[mineIdx];
  let any = false;
  mine.floors.forEach(floor => {
    if (floor.unlocked && !floor.manager && floor.buffer > 0) {
      mine.elevatorQueue += floor.buffer;
      floor.buffer = 0;
      any = true;
    }
  });
  if (any) {
    if (ev) {
      addRipple(el.collectAllBtn, ev);
      spawnOreParticles(ev.clientX, ev.clientY, 10);
    }
    popCash();
    sfxCollect();
    addFrenzy(FRENZY_PER_COLLECT_ALL);
    state.stats.totalManualCollects++;
    bumpQuestProgress('manual_collects', 1);
    maybeDropRelic();
    checkAchievements();
    renderAll();
  }
}

/* =========================================================
   Frenzy / Goldrush (runtime-only, not saved)
   ========================================================= */

let frenzyMeter = 0;
let goldrushActive = false;
let goldrushEndsAt = 0;

function addFrenzy(amount) {
  frenzyMeter = Math.min(100, frenzyMeter + amount);
  if (frenzyMeter >= 100 && !goldrushActive) {
    frenzyMeter = 0;
    triggerGoldrush();
  }
  renderFrenzy();
}

function triggerGoldrush() {
  goldrushActive = true;
  const duration = BASE_GOLDRUSH_DURATION + (hasSkill('goldrush_duration') ? 5 : 0);
  goldrushEndsAt = Date.now() + duration * 1000;
  document.body.classList.add('goldrush-active');
  document.getElementById('goldrush-mult').textContent = String(BASE_GOLDRUSH_MULTIPLIER + (hasSkill('goldrush_power') ? 1 : 0));
  document.getElementById('goldrush-banner').classList.remove('hidden');
  screenShake();
  spawnConfetti(60);
  sfxGoldrush();
  mascotReact();
  state.stats.goldrushesTriggered++;
  bumpQuestProgress('goldrush', 1);
  checkAchievements();
}

function updateGoldrush(nowMs) {
  if (!goldrushActive) return;
  const remaining = Math.max(0, (goldrushEndsAt - nowMs) / 1000);
  const timerEl = document.getElementById('goldrush-timer');
  if (timerEl) timerEl.textContent = Math.ceil(remaining) + 's';
  if (remaining <= 0) {
    goldrushActive = false;
    document.body.classList.remove('goldrush-active');
    document.getElementById('goldrush-banner').classList.add('hidden');
  }
}

function renderFrenzy() {
  const fill = document.getElementById('frenzy-fill');
  if (!fill) return;
  fill.style.width = frenzyMeter + '%';
  fill.classList.toggle('hot', frenzyMeter > 70);
}

/* =========================================================
   Random ore-vein events
   ========================================================= */

function maybeTriggerRandomEvent(dtSeconds) {
  const mineIdx = state.activeMineIndex;
  const mine = state.mines[mineIdx];
  if (!mine) return;
  const alreadyActive = Object.keys(activeEvents).some(k => k.startsWith(mineIdx + '-') && activeEvents[k].until > Date.now());
  if (alreadyActive) return;
  if (Math.random() > EVENT_CHANCE_PER_SEC * dtSeconds) return;
  const unlockedFloors = mine.floors.map((f, i) => i).filter(i => mine.floors[i].unlocked);
  if (unlockedFloors.length === 0) return;
  const floorIdx = unlockedFloors[Math.floor(Math.random() * unlockedFloors.length)];
  activeEvents[mineIdx + '-' + floorIdx] = { until: Date.now() + EVENT_DURATION_MS };
  toast(`⚡ Erzader gefunden in Schacht ${floorIdx + 1}! ×${EVENT_MULTIPLIER} Erz für 20s`);
}

/* =========================================================
   Bonus chest
   ========================================================= */

function renderBonusChestButton() {
  const btn = document.getElementById('bonus-chest-btn');
  if (!btn) return;
  const now = Date.now();
  if (state.bonusChest.activeUntil > now) {
    const remain = Math.ceil((state.bonusChest.activeUntil - now) / 1000);
    btn.innerHTML = `🎁<span class="chest-cooldown">×2 aktiv ${remain}s</span>`;
    btn.disabled = true;
  } else if (state.bonusChest.readyAt > now) {
    const remain = Math.ceil((state.bonusChest.readyAt - now) / 1000 / 60);
    btn.innerHTML = `🎁<span class="chest-cooldown">in ${remain}min</span>`;
    btn.disabled = true;
  } else {
    btn.innerHTML = `🎁<span class="chest-cooldown">×2 Bonus!</span>`;
    btn.disabled = false;
    btn.classList.add('ready-pulse');
    return;
  }
  btn.classList.remove('ready-pulse');
}

function openBonusChest(ev) {
  const now = Date.now();
  if (state.bonusChest.readyAt > now || state.bonusChest.activeUntil > now) return;
  state.bonusChest.activeUntil = now + BONUS_CHEST_ACTIVE_MS;
  state.bonusChest.readyAt = now + BONUS_CHEST_COOLDOWN_MS;
  addRipple(document.getElementById('bonus-chest-btn'), ev);
  spawnConfetti(50);
  screenShake();
  sfxGoldrush();
  mascotReact();
  toast('🎁 Bonus-Truhe geöffnet: ×2 Einnahmen für 5 Minuten!');
  renderBonusChestButton();
  save();
}

/* =========================================================
   Relics
   ========================================================= */

function maybeDropRelic() {
  if (state.relicsFound.length >= RELICS.length) return;
  const chance = RELIC_DROP_CHANCE * (hasSkill('relic_luck') ? 1.5 : 1);
  if (Math.random() > chance) return;
  const remaining = RELICS.filter(r => !state.relicsFound.includes(r.id));
  if (remaining.length === 0) return;
  const relic = remaining[Math.floor(Math.random() * remaining.length)];
  state.relicsFound.push(relic.id);
  toast(`💎 Relikt gefunden: ${relic.icon} ${relic.name}!`);
  spawnConfetti(30);
  mascotReact();
  checkAchievements();
}

function renderCollection() {
  const grid = document.getElementById('collection-grid');
  const summary = document.getElementById('collection-summary');
  summary.textContent = `${state.relicsFound.length} / ${RELICS.length} gefunden`;
  grid.innerHTML = '';
  RELICS.forEach(r => {
    const found = state.relicsFound.includes(r.id);
    const card = document.createElement('div');
    card.className = 'info-card' + (found ? ' unlocked' : ' locked');
    card.innerHTML = `
      <div class="info-card-icon">${found ? r.icon : '❔'}</div>
      <div class="info-card-body">
        <h4>${found ? r.name : '???'}</h4>
        <p>${found ? r.desc : 'Noch nicht gefunden. Sammle manuell Erz ein, um Relikte zu finden.'}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* =========================================================
   Achievements
   ========================================================= */

function checkAchievements() {
  let newlyUnlocked = null;
  ACHIEVEMENTS.forEach(a => {
    if (state.achievementsUnlocked.includes(a.id)) return;
    if (a.check(state)) {
      state.achievementsUnlocked.push(a.id);
      newlyUnlocked = a;
    }
  });
  if (newlyUnlocked) {
    showAchievementPopup(newlyUnlocked);
  }
  updateNavDots();
}

function showAchievementPopup(a) {
  document.getElementById('achievement-popup-icon').textContent = a.icon;
  document.getElementById('achievement-popup-name').textContent = a.name;
  document.getElementById('achievement-popup-desc').textContent = a.desc;
  document.getElementById('achievement-popup').classList.remove('hidden');
  sfxAchievement();
  mascotReact();
  spawnConfetti(40);
}

function renderAchievements() {
  const grid = document.getElementById('achievements-grid');
  const summary = document.getElementById('achievements-summary');
  const unlockedCount = state.achievementsUnlocked.length;
  summary.textContent = `${unlockedCount} / ${ACHIEVEMENTS.length} freigeschaltet · +${Math.round((achievementMultiplier() - 1) * 100)}% Bonus`;
  grid.innerHTML = '';
  ACHIEVEMENTS.forEach(a => {
    const unlocked = state.achievementsUnlocked.includes(a.id);
    const card = document.createElement('div');
    card.className = 'info-card' + (unlocked ? ' unlocked' : ' locked');
    card.innerHTML = `
      <div class="info-card-icon">${unlocked ? a.icon : '🔒'}</div>
      <div class="info-card-body">
        <h4>${a.name}</h4>
        <p>${a.desc}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* =========================================================
   Quests
   ========================================================= */

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function generateDailyQuests() {
  const types = Object.keys(QUEST_DEFS);
  const shuffled = types.slice().sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, 3);
  const quests = picked.map(type => {
    let target = QUEST_TARGETS[type];
    if (type === 'earn_cash') {
      target = Math.max(500, Math.round(totalCashPerSecond() * 180));
    }
    return { type, target, progress: 0, claimed: false };
  });
  state.dailyQuests = { date: todayStr(), quests };
}

function checkQuestRollover() {
  if (!state.dailyQuests || state.dailyQuests.date !== todayStr()) {
    generateDailyQuests();
  }
}

function bumpQuestProgress(type, amount) {
  if (!state.dailyQuests || state.dailyQuests.date !== todayStr()) return;
  const q = state.dailyQuests.quests.find(q => q.type === type && !q.claimed);
  if (!q) return;
  q.progress = Math.min(q.target, q.progress + amount);
  updateNavDots();
}

function questReward(quest) {
  const base = Math.max(100, totalCashPerSecond() * 150, state.cash * 0.05);
  return Math.round(base * (hasSkill('quest_reward_boost') ? 1.5 : 1));
}

function claimQuest(idx, ev) {
  const q = state.dailyQuests.quests[idx];
  if (!q || q.claimed || q.progress < q.target) return;
  const reward = questReward(q);
  addCash(reward);
  q.claimed = true;
  if (ev) addRipple(ev.currentTarget, ev);
  spawnConfetti(30);
  sfxBuy();
  toast(`📜 Quest erfüllt: +${formatCash(reward)}`);
  renderQuests();
  renderTopbar();
}

function renderQuests() {
  checkQuestRollover();
  const list = document.getElementById('quests-list');
  const summary = document.getElementById('quests-summary');
  const completed = state.dailyQuests.quests.filter(q => q.claimed).length;
  summary.textContent = `${completed} / ${state.dailyQuests.quests.length} abgeschlossen · neue Quests um Mitternacht`;
  list.innerHTML = '';
  state.dailyQuests.quests.forEach((q, idx) => {
    const def = QUEST_DEFS[q.type];
    const pct = Math.min(100, (q.progress / q.target) * 100);
    const done = q.progress >= q.target;
    const card = document.createElement('div');
    card.className = 'info-card' + (q.claimed ? ' unlocked' : '');
    card.innerHTML = `
      <div class="info-card-icon">${def.icon}</div>
      <div class="info-card-body">
        <h4>${def.desc(q.target)}</h4>
        <div class="info-card-progress"><div class="info-card-progress-fill" style="width:${pct}%"></div></div>
        <div class="info-card-footer">
          <span>${formatNumber(q.progress)} / ${formatNumber(q.target)}</span>
          ${q.claimed
            ? '<span class="highlight">✓ Belohnt</span>'
            : `<button class="btn btn-small ${done ? 'ready-pulse btn-primary' : ''}" ${done ? '' : 'disabled'} data-claim="${idx}">+${formatCash(questReward(q))}</button>`}
        </div>
      </div>
    `;
    list.appendChild(card);
  });
  list.querySelectorAll('[data-claim]').forEach(btn => {
    btn.addEventListener('click', (ev) => claimQuest(parseInt(btn.getAttribute('data-claim'), 10), ev));
  });
  updateNavDots();
}

/* =========================================================
   Skills (Talente)
   ========================================================= */

function buySkill(id, ev) {
  if (hasSkill(id)) return;
  const def = SKILLS.find(s => s.id === id);
  if (!def || state.skillPoints < def.cost) return;
  state.skillPoints -= def.cost;
  state.skillsBought.push(id);
  if (ev) addRipple(ev.currentTarget, ev);
  spawnConfetti(30);
  sfxBuy();
  mascotReact();
  renderSkills();
  renderAll();
  save();
}

function renderSkills() {
  document.getElementById('skillpoints-display').textContent = state.skillPoints;
  const grid = document.getElementById('skills-grid');
  grid.innerHTML = '';
  SKILLS.forEach(s => {
    const bought = hasSkill(s.id);
    const affordable = state.skillPoints >= s.cost;
    const card = document.createElement('div');
    card.className = 'info-card' + (bought ? ' unlocked' : '');
    card.innerHTML = `
      <div class="info-card-icon">${s.icon}</div>
      <div class="info-card-body">
        <h4>${s.name}</h4>
        <p>${s.desc}</p>
        <div class="info-card-footer">
          ${bought
            ? '<span class="highlight">✓ Freigeschaltet</span>'
            : `<button class="btn btn-small ${affordable ? 'ready-pulse btn-primary' : ''}" ${affordable ? '' : 'disabled'} data-buy-skill="${s.id}">${s.cost} Talentpunkt${s.cost > 1 ? 'e' : ''}</button>`}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  grid.querySelectorAll('[data-buy-skill]').forEach(btn => {
    btn.addEventListener('click', (ev) => buySkill(btn.getAttribute('data-buy-skill'), ev));
  });
  updateNavDots();
}

/* =========================================================
   Stats view
   ========================================================= */

function renderStats() {
  const grid = document.getElementById('stats-grid');
  const tiles = [
    { icon: '💰', label: 'Lebenszeit-Einnahmen', value: formatCash(state.lifetimeCashEarned) },
    { icon: '⏱️', label: 'Spielzeit', value: formatDuration(state.stats.playSeconds) },
    { icon: '🖐️', label: 'Manuell gesammelt', value: formatNumber(state.stats.totalManualCollects) },
    { icon: '⬆️', label: 'Upgrades gekauft', value: formatNumber(state.stats.totalUpgradesBought) },
    { icon: '🤖', label: 'Manager eingestellt', value: formatNumber(state.stats.totalManagersHired) },
    { icon: '🗺️', label: 'Minen freigeschaltet', value: `${state.mines.filter(m => m.unlocked).length} / ${MINES.length}` },
    { icon: '🔥', label: 'Goldräusche ausgelöst', value: formatNumber(state.stats.goldrushesTriggered) },
    { icon: '🏆', label: 'Erfolge', value: `${state.achievementsUnlocked.length} / ${ACHIEVEMENTS.length}` },
    { icon: '💎', label: 'Relikte', value: `${state.relicsFound.length} / ${RELICS.length}` },
    { icon: '💼', label: 'Prestige-Resets', value: formatNumber(state.prestigeCount) },
    { icon: '📅', label: 'Login-Streak', value: `${state.loginStreak} Tage` },
    { icon: '🌳', label: 'Talente', value: `${state.skillsBought.length} / ${SKILLS.length}` },
  ];
  grid.innerHTML = tiles.map(t => `
    <div class="info-card">
      <div class="info-card-icon">${t.icon}</div>
      <div class="info-card-body"><h4>${t.value}</h4><p>${t.label}</p></div>
    </div>
  `).join('');
  drawCashChart();
}

function drawCashChart() {
  const canvas = document.getElementById('cash-chart');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const w = Math.max(200, wrap.clientWidth);
  canvas.width = w;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, 120);
  if (cashHistory.length < 2) {
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-dim') || '#b9ab93';
    ctx.font = '13px sans-serif';
    ctx.fillText('Sammle mehr Daten während des Spielens…', 12, 60);
    return;
  }
  const values = cashHistory.map(p => p.cash);
  const min = Math.min(...values);
  const max = Math.max(...values, min + 1);
  const pad = 10;
  ctx.beginPath();
  cashHistory.forEach((p, i) => {
    const x = pad + (i / (cashHistory.length - 1)) * (w - pad * 2);
    const y = 120 - pad - ((p.cash - min) / (max - min)) * (120 - pad * 2);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  const gold = getComputedStyle(document.body).getPropertyValue('--gold') || '#f4c04d';
  ctx.strokeStyle = gold.trim();
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.lineTo(w - pad, 120 - pad);
  ctx.lineTo(pad, 120 - pad);
  ctx.closePath();
  ctx.fillStyle = 'rgba(244,192,77,.12)';
  ctx.fill();
}

/* =========================================================
   Settings view
   ========================================================= */

function renderSettings() {
  document.getElementById('setting-sound').checked = state.settings.soundEnabled;
  document.getElementById('setting-perf').checked = state.settings.performanceMode;
  document.getElementById('setting-mascot').checked = state.settings.showMascot;
  document.getElementById('setting-theme').checked = state.settings.theme === 'light';
  document.getElementById('setting-autobuy').checked = state.settings.autoBuyEnabled;
  document.getElementById('my-score-code').value = myScoreCode();
  applySettingsToDom();
}

function applySettingsToDom() {
  document.body.classList.toggle('theme-light', state.settings.theme === 'light');
  document.getElementById('mascot').classList.toggle('hidden-setting', !state.settings.showMascot);
}

function wireSettingsEvents() {
  document.getElementById('setting-sound').addEventListener('change', (e) => { state.settings.soundEnabled = e.target.checked; save(); });
  document.getElementById('setting-perf').addEventListener('change', (e) => { state.settings.performanceMode = e.target.checked; save(); });
  document.getElementById('setting-mascot').addEventListener('change', (e) => { state.settings.showMascot = e.target.checked; applySettingsToDom(); save(); });
  document.getElementById('setting-theme').addEventListener('change', (e) => { state.settings.theme = e.target.checked ? 'light' : 'dark'; applySettingsToDom(); save(); });
  document.getElementById('setting-autobuy').addEventListener('change', (e) => { state.settings.autoBuyEnabled = e.target.checked; save(); });
  document.getElementById('replay-tutorial-btn').addEventListener('click', () => startTutorial(true));
  document.getElementById('export-save-btn').addEventListener('click', exportSave);
  document.getElementById('import-save-btn').addEventListener('click', () => document.getElementById('import-file-input').click());
  document.getElementById('import-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) importSaveFile(file);
    e.target.value = '';
  });
  document.getElementById('share-card-btn').addEventListener('click', generateShareCard);
  document.getElementById('copy-score-code-btn').addEventListener('click', copyScoreCode);
  document.getElementById('compare-score-code-btn').addEventListener('click', compareScoreCode);
}

/* =========================================================
   Export / Import / Share / Score-code
   ========================================================= */

function exportSave() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'idle-mining-tycoon-save.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('💾 Spielstand exportiert!');
}

function importSaveFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const loaded = JSON.parse(reader.result);
      applyLoadedState(loaded);
      applyMineTheme(state.activeMineIndex);
      renderAll();
      renderSettings();
      save();
      toast('✅ Spielstand importiert!');
    } catch (e) {
      toast('❌ Ungültige Datei');
    }
  };
  reader.readAsText(file);
}

function generateShareCard() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 450;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 800, 450);
  grad.addColorStop(0, '#241a10');
  grad.addColorStop(1, '#120d08');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 450);
  ctx.strokeStyle = '#c9962f';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 780, 430);

  ctx.fillStyle = '#f4c04d';
  ctx.font = 'bold 38px sans-serif';
  ctx.fillText('⛏️ Idle Mining Tycoon', 40, 70);

  const rows = [
    `💰 Kontostand: ${formatCash(state.cash)}`,
    `📈 Lebenszeit-Einnahmen: ${formatCash(state.lifetimeCashEarned)}`,
    `💼 Investoren: ${state.prestigePoints}`,
    `🏆 Erfolge: ${state.achievementsUnlocked.length} / ${ACHIEVEMENTS.length}`,
    `💎 Relikte: ${state.relicsFound.length} / ${RELICS.length}`,
    `⏱️ Spielzeit: ${formatDuration(state.stats.playSeconds)}`,
  ];
  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#f2e9d8';
  rows.forEach((r, i) => ctx.fillText(r, 40, 140 + i * 46));

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'idle-mining-tycoon-progress.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('📤 Fortschrittsbild erstellt!');
  });
}

function myScoreCode() {
  const payload = {
    c: Math.round(state.cash),
    l: Math.round(state.lifetimeCashEarned),
    p: state.prestigePoints,
    a: state.achievementsUnlocked.length,
    m: state.mines.filter(m => m.unlocked).length,
  };
  try { return btoa(JSON.stringify(payload)); } catch (e) { return ''; }
}

function copyScoreCode() {
  const input = document.getElementById('my-score-code');
  input.select();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(input.value).then(() => toast('📋 Code kopiert!')).catch(() => toast('📋 Code markiert — jetzt kopieren'));
  } else {
    document.execCommand('copy');
    toast('📋 Code kopiert!');
  }
}

function compareScoreCode() {
  const code = document.getElementById('friend-score-code').value.trim();
  const result = document.getElementById('score-compare-result');
  if (!code) { result.innerHTML = '<p>Bitte zuerst einen Code einfügen.</p>'; return; }
  let other;
  try { other = JSON.parse(atob(code)); } catch (e) { result.innerHTML = '<p>❌ Ungültiger Code.</p>'; return; }
  const mine = { c: Math.round(state.cash), l: Math.round(state.lifetimeCashEarned), p: state.prestigePoints, a: state.achievementsUnlocked.length, m: state.mines.filter(m => m.unlocked).length };
  const rows = [
    ['Kasse', formatCash(mine.c), formatCash(other.c || 0)],
    ['Lebenszeit-Einnahmen', formatCash(mine.l), formatCash(other.l || 0)],
    ['Investoren', mine.p, other.p || 0],
    ['Erfolge', mine.a, other.a || 0],
    ['Minen', mine.m, other.m || 0],
  ];
  result.innerHTML = `<table><tr><td></td><td><b>Du</b></td><td><b>Freund</b></td></tr>${
    rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')
  }</table>`;
}

/* =========================================================
   Auto-buyer
   ========================================================= */

function runAutoBuyer() {
  if (!state.settings.autoBuyEnabled) return;
  const mineIdx = state.activeMineIndex;
  const mine = state.mines[mineIdx];
  let iterations = 0;
  let bought = false;
  while (iterations < 25) {
    iterations++;
    const options = [];
    mine.floors.forEach((f, fi) => {
      if (f.unlocked) {
        options.push({ type: 'upgrade', floorIdx: fi, cost: floorUpgradeCost(mineIdx, fi, f.level) });
        if (!f.manager) options.push({ type: 'manager', floorIdx: fi, cost: floorManagerCost(mineIdx, fi) });
      }
    });
    options.push({ type: 'elevator', cost: elevatorUpgradeCost(mineIdx, mine.elevatorLevel) });
    const affordable = options.filter(o => o.cost <= state.cash);
    if (affordable.length === 0) break;
    affordable.sort((a, b) => a.cost - b.cost);
    const pick = affordable[0];
    if (pick.type === 'upgrade') {
      state.cash -= pick.cost;
      mine.floors[pick.floorIdx].level++;
      state.stats.totalUpgradesBought++;
      bumpQuestProgress('upgrades', 1);
    } else if (pick.type === 'manager') {
      state.cash -= pick.cost;
      mine.floors[pick.floorIdx].manager = true;
      state.stats.totalManagersHired++;
      bumpQuestProgress('managers', 1);
    } else if (pick.type === 'elevator') {
      state.cash -= pick.cost;
      mine.elevatorLevel++;
    }
    bought = true;
  }
  if (bought) checkAchievements();
  return bought;
}

/* =========================================================
   Daily login
   ========================================================= */

function checkDailyLogin(onDone) {
  const today = todayStr();
  if (state.lastLoginDate === today) { if (onDone) onDone(); return; }

  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;

  if (state.lastLoginDate === yesterday) {
    state.loginStreak += 1;
  } else {
    state.loginStreak = 1;
  }
  state.lastLoginDate = today;

  const reward = Math.round(50 * state.loginStreak * (1 + state.prestigePoints * 0.05));
  document.getElementById('daily-streak').textContent = state.loginStreak;
  document.getElementById('daily-reward').textContent = `+${formatCash(reward)}`;
  document.getElementById('daily-modal').classList.remove('hidden');
  document.getElementById('daily-claim-btn').onclick = () => {
    addCash(reward);
    document.getElementById('daily-modal').classList.add('hidden');
    checkAchievements();
    renderAll();
    save();
    if (onDone) onDone();
  };
  checkAchievements();
}

/* =========================================================
   Prestige
   ========================================================= */

function openPrestigeModal() {
  const gain = potentialPrestigeGain();
  document.getElementById('prestige-gain').textContent = gain;
  document.getElementById('prestige-skillpoint-gain').textContent = gain > 0 ? 1 : 0;
  const newMult = Math.round(((1 + (state.prestigePoints + gain) * PRESTIGE_BONUS_PER_POINT) - 1) * 100);
  document.getElementById('prestige-new-mult').textContent = `+${newMult}%`;
  document.getElementById('prestige-confirm-btn').disabled = gain <= 0;
  document.getElementById('prestige-modal').classList.remove('hidden');
}

function closePrestigeModal() {
  document.getElementById('prestige-modal').classList.add('hidden');
}

function doPrestige() {
  const gain = potentialPrestigeGain();
  if (gain <= 0) return;

  const keep = {
    lifetimeCashEarned: state.lifetimeCashEarned,
    prestigeCount: state.prestigeCount + 1,
    skillPoints: state.skillPoints + 1,
    skillsBought: state.skillsBought,
    achievementsUnlocked: state.achievementsUnlocked,
    relicsFound: state.relicsFound,
    stats: state.stats,
    dailyQuests: state.dailyQuests,
    lastLoginDate: state.lastLoginDate,
    loginStreak: state.loginStreak,
    bonusChest: state.bonusChest,
    settings: state.settings,
    prestigePoints: state.prestigePoints + gain,
  };

  state = freshState();
  Object.assign(state, keep);
  if (hasSkill('prestige_headstart')) state.cash += 500;

  frenzyMeter = 0;
  goldrushActive = false;
  activeEvents = {};
  document.body.classList.remove('goldrush-active');
  document.getElementById('goldrush-banner').classList.add('hidden');
  applyMineTheme(0);
  closePrestigeModal();
  prestigeCelebration();
  sfxPrestige();
  checkAchievements();
  renderAll();
  save();
}

/* =========================================================
   Sound (Web Audio synth, no external files)
   ========================================================= */

let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* unsupported */ }
  }
  return audioCtx;
}
function playTone(freq, dur, type, vol, delay) {
  if (!state.settings.soundEnabled) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  const t0 = ctx.currentTime + (delay || 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol || 0.05, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + (dur || 0.1));
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + (dur || 0.1) + 0.02);
}
function sfxCollect() { playTone(660, 0.08, 'triangle', 0.035); }
function sfxBuy() { playTone(440, 0.06, 'square', 0.03); playTone(660, 0.06, 'square', 0.03, 0.05); }
function sfxGoldrush() { [440, 660, 880, 1100].forEach((f, i) => playTone(f, 0.15, 'sawtooth', 0.045, i * 0.08)); }
function sfxAchievement() { [523, 659, 784].forEach((f, i) => playTone(f, 0.18, 'triangle', 0.05, i * 0.1)); }
function sfxPrestige() { [392, 523, 659, 784, 988].forEach((f, i) => playTone(f, 0.2, 'triangle', 0.055, i * 0.09)); }

/* =========================================================
   Misc UI helpers
   ========================================================= */

function shake(elem) {
  if (!elem) return;
  elem.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-4px)' },
    { transform: 'translateX(4px)' },
    { transform: 'translateX(0)' },
  ], { duration: 220 });
}

function spawnFloatText(x, y, text) {
  const node = document.createElement('div');
  node.className = 'float-text';
  node.style.left = x + 'px';
  node.style.top = y + 'px';
  node.textContent = text;
  el.floatLayer.appendChild(node);
  setTimeout(() => node.remove(), 900);
}

const ORE_EMOJIS = ['🪙', '⛏️', '✨', '💰'];

function spawnOreParticles(x, y, count) {
  const n = state.settings.performanceMode ? Math.max(1, Math.floor(count / 4)) : count;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.className = 'particle particle-ore';
    p.textContent = ORE_EMOJIS[Math.floor(Math.random() * ORE_EMOJIS.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 80;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 50;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.setProperty('--dx', dx + 'px');
    p.style.setProperty('--dy', dy + 'px');
    p.style.setProperty('--rot', (Math.random() * 360 - 180) + 'deg');
    el.floatLayer.appendChild(p);
    setTimeout(() => p.remove(), 850);
  }
}

const CONFETTI_COLORS = ['#f4c04d', '#e0645a', '#5aa9e0', '#6fcf6f', '#c9962f'];

function spawnConfetti(count) {
  const n = state.settings.performanceMode ? Math.max(1, Math.floor(count / 5)) : count;
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div');
    c.className = 'particle particle-confetti';
    c.style.left = (Math.random() * 100) + 'vw';
    c.style.top = '-20px';
    c.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    c.style.setProperty('--dx', (Math.random() * 240 - 120) + 'px');
    c.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    c.style.animationDelay = (Math.random() * 0.3) + 's';
    el.floatLayer.appendChild(c);
    setTimeout(() => c.remove(), 2000);
  }
}

function screenShake() {
  if (state.settings.performanceMode) return;
  document.body.classList.remove('screen-shake');
  void document.body.offsetWidth;
  document.body.classList.add('screen-shake');
  setTimeout(() => document.body.classList.remove('screen-shake'), 500);
}

function addRipple(btn, ev) {
  if (!btn || !ev) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const span = document.createElement('span');
  span.className = 'ripple';
  span.style.width = span.style.height = size + 'px';
  span.style.left = (ev.clientX - rect.left - size / 2) + 'px';
  span.style.top = (ev.clientY - rect.top - size / 2) + 'px';
  btn.appendChild(span);
  setTimeout(() => span.remove(), 500);
}

function popCash() {
  el.cash.classList.remove('pop');
  void el.cash.offsetWidth;
  el.cash.classList.add('pop');
}

function prestigeCelebration() {
  const overlay = document.createElement('div');
  overlay.className = 'prestige-flash-overlay';
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 1200);
  spawnConfetti(90);
  screenShake();
}

function mascotReact() {
  const m = document.getElementById('mascot');
  if (!m) return;
  m.classList.remove('excited');
  void m.offsetWidth;
  m.classList.add('excited');
  setTimeout(() => m.classList.remove('excited'), 1600);
}

let lastElevatorParticle = 0;
function maybeSpawnElevatorParticle(nowMs) {
  if (state.settings.performanceMode) return;
  const mine = state.mines[state.activeMineIndex];
  if (!mine || mine.elevatorQueue <= 0) return;
  if (nowMs - lastElevatorParticle < 350) return;
  lastElevatorParticle = nowMs;
  const shaft = document.querySelector('.elevator-shaft');
  if (!shaft) return;
  const dot = document.createElement('div');
  dot.className = 'ore-rise';
  dot.style.left = (42 + Math.random() * 16) + '%';
  shaft.appendChild(dot);
  setTimeout(() => dot.remove(), 1150);
}

function toast(html, duration) {
  const layer = document.getElementById('toast-layer');
  if (!layer) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = html;
  layer.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, duration || 3500);
}

function updateNavDots() {
  const questsDot = document.getElementById('nav-dot-quests');
  if (state.dailyQuests && state.dailyQuests.date === todayStr()) {
    const claimable = state.dailyQuests.quests.some(q => !q.claimed && q.progress >= q.target);
    questsDot.classList.toggle('show', claimable);
  }
  const skillsDot = document.getElementById('nav-dot-skills');
  const anyAffordable = SKILLS.some(s => !hasSkill(s.id) && state.skillPoints >= s.cost);
  skillsDot.classList.toggle('show', anyAffordable);
}

let saveFlashTimeout = null;
function flashSaved() {
  el.saveIndicator.textContent = 'Gespeichert ✓';
  clearTimeout(saveFlashTimeout);
  saveFlashTimeout = setTimeout(() => { el.saveIndicator.textContent = 'Automatisches Speichern aktiv'; }, 1500);
}

/* =========================================================
   Tutorial
   ========================================================= */

const TUTORIAL_SLIDES = [
  { icon: '⛏️', title: 'Willkommen im Bergbau!', text: 'Baue dein Mining-Imperium auf: Schächte produzieren Erz, das über den Aufzug zu Geld wird.' },
  { icon: '🖐️', title: 'Schächte sammeln', text: 'Jeder Schacht füllt einen Balken mit Erz. Tippe darauf, um es einzusammeln — oder kaufe einen Manager, der das automatisch erledigt.' },
  { icon: '🛗', title: 'Der Aufzug', text: 'Der Aufzug transportiert Erz nach oben und wandelt es in Geld um — er hat aber ein Durchsatz-Limit. Upgrade ihn, wenn sich Erz staut.' },
  { icon: '🗺️', title: 'Neue Minen & Prestige', text: 'Schalte neue, lukrativere Minen frei. Mit "Prestige" verkaufst du dein Imperium für dauerhafte Boni und startest stärker neu.' },
  { icon: '🏆', title: 'Erfolge, Quests & Talente', text: 'Über die Leiste unten findest du Tagesquests, Erfolge, ein Talent-System, deine Statistik und Einstellungen. Viel Erfolg!' },
];
let tutorialIndex = 0;
let tutorialOnDone = null;

function startTutorial(force, onDone) {
  if (!force && localStorage.getItem(TUTORIAL_KEY)) { if (onDone) onDone(); return; }
  tutorialIndex = 0;
  renderTutorialSlide();
  document.getElementById('tutorial-modal').classList.remove('hidden');
  tutorialOnDone = onDone || null;
}

function renderTutorialSlide() {
  const slide = TUTORIAL_SLIDES[tutorialIndex];
  document.getElementById('tutorial-icon').textContent = slide.icon;
  document.getElementById('tutorial-title').textContent = slide.title;
  document.getElementById('tutorial-text').textContent = slide.text;
  const dots = document.getElementById('tutorial-dots');
  dots.innerHTML = TUTORIAL_SLIDES.map((_, i) => `<span class="${i === tutorialIndex ? 'active' : ''}"></span>`).join('');
  const nextBtn = document.getElementById('tutorial-next-btn');
  nextBtn.textContent = tutorialIndex === TUTORIAL_SLIDES.length - 1 ? "Los geht's!" : 'Weiter';
}

function closeTutorial() {
  document.getElementById('tutorial-modal').classList.add('hidden');
  localStorage.setItem(TUTORIAL_KEY, '1');
  const cb = tutorialOnDone;
  tutorialOnDone = null;
  if (cb) cb();
}

/* =========================================================
   Navigation
   ========================================================= */

function showView(viewName) {
  document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active-view'));
  const target = document.getElementById('view-' + viewName);
  if (target) target.classList.add('active-view');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === viewName));
  if (viewName === 'achievements') renderAchievements();
  if (viewName === 'quests') renderQuests();
  if (viewName === 'skills') renderSkills();
  if (viewName === 'stats') renderStats();
  if (viewName === 'collection') renderCollection();
  if (viewName === 'settings') renderSettings();
}

/* =========================================================
   Offline earnings modal
   ========================================================= */

function showOfflineModalIfNeeded() {
  const elapsed = (Date.now() - state.lastSave) / 1000;
  if (elapsed < 10) return;
  const earned = simulateOffline(elapsed);
  if (earned <= 0) return;
  addCash(earned);
  const capped = Math.min(elapsed, offlineCapSeconds());
  document.getElementById('offline-text').textContent =
    `Deine Manager haben ${formatDuration(capped)} lang weitergearbeitet.`;
  document.getElementById('offline-earnings').textContent = `+${formatCash(earned)}`;
  document.getElementById('offline-modal').classList.remove('hidden');
}

/* =========================================================
   PWA service worker registration
   ========================================================= */

function registerServiceWorker() {
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* ignore */ });
    });
  }
}

/* =========================================================
   Boot
   ========================================================= */

function init() {
  load();
  applyMineTheme(state.activeMineIndex);
  applySettingsToDom();
  checkQuestRollover();
  checkAchievements();
  renderAll();
  showView('game');
  startTutorial(false, () => {
    checkDailyLogin(() => {
      showOfflineModalIfNeeded();
    });
  });
  registerServiceWorker();

  el.collectAllBtn.addEventListener('click', collectAll);
  el.foremanBtn.addEventListener('click', (ev) => hireForeman(state.activeMineIndex, ev));
  document.getElementById('bonus-chest-btn').addEventListener('click', openBonusChest);
  document.getElementById('prestige-open-btn').addEventListener('click', openPrestigeModal);
  document.getElementById('prestige-cancel-btn').addEventListener('click', closePrestigeModal);
  document.getElementById('prestige-confirm-btn').addEventListener('click', doPrestige);
  document.getElementById('offline-close-btn').addEventListener('click', () => {
    document.getElementById('offline-modal').classList.add('hidden');
    renderAll();
  });
  document.getElementById('achievement-popup-close').addEventListener('click', () => {
    document.getElementById('achievement-popup').classList.add('hidden');
  });
  document.getElementById('tutorial-skip-btn').addEventListener('click', closeTutorial);
  document.getElementById('tutorial-next-btn').addEventListener('click', () => {
    if (tutorialIndex === TUTORIAL_SLIDES.length - 1) { closeTutorial(); return; }
    tutorialIndex++;
    renderTutorialSlide();
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Wirklich den kompletten Spielstand löschen? Das kann nicht rückgängig gemacht werden.')) {
      localStorage.removeItem(SAVE_KEY);
      state = freshState();
      applyMineTheme(0);
      applySettingsToDom();
      renderAll();
    }
  });
  document.querySelectorAll('.nav-btn').forEach(b => b.addEventListener('click', (ev) => { addRipple(b, ev); showView(b.dataset.view); }));
  wireSettingsEvents();

  let lastTick = performance.now();
  let statsTickCounter = 0;
  let historyTickCounter = 0;
  setInterval(() => {
    const now = performance.now();
    const dt = (now - lastTick) / 1000;
    lastTick = now;
    tick(dt);
    updateGoldrush(Date.now());
    maybeTriggerRandomEvent(dt);
    if (frenzyMeter > 0) {
      frenzyMeter = Math.max(0, frenzyMeter - FRENZY_DECAY_PER_SEC * dt);
      renderFrenzy();
    }
    maybeSpawnElevatorParticle(now);
    runAutoBuyer();
    renderTopbar();
    renderElevator();
    renderBonusChestButton();
    updateFloorBarsOnly();

    statsTickCounter++;
    if (statsTickCounter >= 10) { // ~1s
      statsTickCounter = 0;
      checkAchievements();
    }
    historyTickCounter++;
    if (historyTickCounter >= 50) { // ~5s
      historyTickCounter = 0;
      cashHistory.push({ t: Date.now(), cash: state.cash });
      if (cashHistory.length > 150) cashHistory.shift();
      if (document.getElementById('view-stats').classList.contains('active-view')) drawCashChart();
    }
  }, TICK_MS);

  setInterval(save, AUTOSAVE_MS);
  window.addEventListener('beforeunload', save);

  document.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.code === 'Space') { e.preventDefault(); collectAll(); }
    else if (e.key >= '1' && e.key <= '9') {
      const idx = parseInt(e.key, 10) - 1;
      if (idx < MINES.length && state.mines[idx].unlocked) {
        state.activeMineIndex = idx;
        applyMineTheme(idx);
        showView('game');
        renderAll();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (document.getElementById('view-stats').classList.contains('active-view')) drawCashChart();
  });
}

function updateFloorBarsOnly() {
  const mineIdx = state.activeMineIndex;
  const mine = state.mines[mineIdx];
  const rows = el.floorsList.querySelectorAll('.floor-row');
  const unlockedFloors = mine.floors
    .map((f, i) => ({ f, i }))
    .filter(x => x.f.unlocked);

  rows.forEach((row, idx) => {
    const data = unlockedFloors[idx];
    if (!data) return;
    const { f: floor, i: floorIdx } = data;
    const capacity = floorCapacity(mineIdx, floorIdx, floor.level);
    const fillPct = capacity > 0 ? Math.min(100, (floor.buffer / capacity) * 100) : 0;
    const fillEl = row.querySelector('.floor-bar-fill');
    if (fillEl) fillEl.style.width = fillPct + '%';
    const barEl = row.querySelector('.floor-bar');
    if (barEl) barEl.classList.toggle('warn', !floor.manager && fillPct >= 85);
    const eventOn = floorEventMultiplier(mineIdx, floorIdx) > 1;
    row.classList.toggle('event-active', eventOn);
  });
}

init();
