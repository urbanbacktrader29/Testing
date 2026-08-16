'use strict';

/* =========================================================
   IDLE MINING TYCOON — Configuration
   ========================================================= */

const MAX_FLOORS = 6;
const STARTING_FLOORS = 3;
const FLOOR_BUFFER_SECONDS = 90;      // how many seconds of production a floor can hold before it stalls
const SAVE_KEY = 'idleMiningTycoon_save_v1';
const AUTOSAVE_MS = 10000;
const TICK_MS = 100;
const OFFLINE_CAP_SECONDS = 8 * 3600; // max 8h of offline production simulated
const PRESTIGE_DIVISOR = 5e7;         // tune how fast prestige points accumulate
const PRESTIGE_BONUS_PER_POINT = 0.02; // +2% production per investor

const FRENZY_DECAY_PER_SEC = 14;
const FRENZY_PER_CLICK = 20;
const FRENZY_PER_COLLECT_ALL = 6;
const GOLDRUSH_DURATION = 12;    // seconds
const GOLDRUSH_MULTIPLIER = 3;

const MINES = [
  { id: 'copper',  name: 'Kupfermine',    icon: '⛏️', unlockCost: 0,             oreValue: 1,    floorBaseRate: 0.5, floorCostBase: 10,      elevatorBaseThroughput: 5,    elevatorCostBase: 100 },
  { id: 'silver',  name: 'Silbermine',    icon: '🪨', unlockCost: 75000,         oreValue: 5,    floorBaseRate: 2,   floorCostBase: 60,      elevatorBaseThroughput: 15,   elevatorCostBase: 800 },
  { id: 'gold',    name: 'Goldmine',      icon: '🥇', unlockCost: 3000000,       oreValue: 25,   floorBaseRate: 8,   floorCostBase: 400,     elevatorBaseThroughput: 50,   elevatorCostBase: 6000 },
  { id: 'diamond', name: 'Diamantmine',   icon: '💎', unlockCost: 150000000,     oreValue: 120,  floorBaseRate: 30,  floorCostBase: 3000,    elevatorBaseThroughput: 180,  elevatorCostBase: 45000 },
  { id: 'oil',     name: 'Ölfeld',        icon: '🛢️', unlockCost: 8000000000,    oreValue: 600,  floorBaseRate: 100, floorCostBase: 20000,   elevatorBaseThroughput: 600,  elevatorCostBase: 300000 },
  { id: 'crystal', name: 'Kristallmine',  icon: '🔮', unlockCost: 400000000000, oreValue: 3000, floorBaseRate: 350, floorCostBase: 150000,  elevatorBaseThroughput: 2000, elevatorCostBase: 2000000 },
];

const FLOOR_ICONS = ['⛏️', '🔨', '🧨', '🚂', '🔦', '⚒️'];

/* =========================================================
   Formulas
   ========================================================= */

function floorRate(mineIdx, floorIdx, level) {
  const cfg = MINES[mineIdx];
  const base = cfg.floorBaseRate * (1 + floorIdx * 0.6);
  return base * level * prestigeMultiplier() * frenzyMultiplier();
}

function floorCapacity(mineIdx, floorIdx, level) {
  return floorRate(mineIdx, floorIdx, level) * FLOOR_BUFFER_SECONDS;
}

function floorUpgradeCost(mineIdx, floorIdx, level) {
  const cfg = MINES[mineIdx];
  const base = cfg.floorCostBase * (1 + floorIdx * 0.8);
  return Math.ceil(base * Math.pow(1.15, level - 1));
}

function floorManagerCost(mineIdx, floorIdx) {
  const cfg = MINES[mineIdx];
  return Math.ceil(cfg.floorCostBase * (1 + floorIdx) * 40);
}

function floorUnlockCost(mineIdx, floorIdx) {
  const cfg = MINES[mineIdx];
  return Math.ceil(cfg.floorCostBase * Math.pow(6, floorIdx));
}

function elevatorThroughput(mineIdx, level) {
  const cfg = MINES[mineIdx];
  return cfg.elevatorBaseThroughput * (1 + 0.25 * (level - 1));
}

function elevatorUpgradeCost(mineIdx, level) {
  const cfg = MINES[mineIdx];
  return Math.ceil(cfg.elevatorCostBase * Math.pow(1.28, level - 1));
}

function prestigeMultiplier() {
  return 1 + state.prestigePoints * PRESTIGE_BONUS_PER_POINT;
}

function potentialPrestigeGain() {
  return Math.floor(Math.sqrt(Math.max(0, state.runCashEarned) / PRESTIGE_DIVISOR));
}

/* =========================================================
   Frenzy / Goldrush (runtime-only, not saved)
   ========================================================= */

let frenzyMeter = 0;
let goldrushActive = false;
let goldrushEndsAt = 0;

function frenzyMultiplier() {
  return goldrushActive ? GOLDRUSH_MULTIPLIER : 1;
}

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
  goldrushEndsAt = performance.now() + GOLDRUSH_DURATION * 1000;
  document.body.classList.add('goldrush-active');
  document.getElementById('goldrush-banner').classList.remove('hidden');
  screenShake();
  spawnConfetti(60);
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
   State
   ========================================================= */

let state = null;

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
    floors,
  };
}

function freshState() {
  return {
    cash: 50,
    lifetimeCashEarned: 50,
    runCashEarned: 0,
    prestigePoints: 0,
    activeMineIndex: 0,
    lastSave: Date.now(),
    mines: MINES.map((_, i) => freshMineState(i)),
  };
}

function addCash(amount) {
  state.cash += amount;
  state.lifetimeCashEarned += amount;
  state.runCashEarned += amount;
}

/* =========================================================
   Save / Load / Offline earnings
   ========================================================= */

function save() {
  state.lastSave = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  flashSaved();
}

function load() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    state = freshState();
    return;
  }
  try {
    const loaded = JSON.parse(raw);
    // basic shape defense: merge onto fresh state so new fields/mines don't break old saves
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
  } catch (e) {
    console.error('Save corrupted, starting fresh', e);
    state = freshState();
  }
}

function simulateOffline(elapsedSeconds) {
  const capped = Math.min(elapsedSeconds, OFFLINE_CAP_SECONDS);
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

/* =========================================================
   Rendering
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
  elevatorFill: document.getElementById('elevator-fill'),
  elevatorThroughput: document.getElementById('elevator-throughput'),
  elevatorQueue: document.getElementById('elevator-queue'),
  elevatorUpgradeBtn: document.getElementById('elevator-upgrade-btn'),
  mineCps: document.getElementById('mine-cps'),
  saveIndicator: document.getElementById('save-indicator'),
  floatLayer: document.getElementById('float-layer'),
};

function renderTopbar() {
  el.cash.textContent = formatCash(state.cash);
  el.cps.textContent = formatCash(totalCashPerSecond()) + '/s';
  const bonusPct = Math.round((prestigeMultiplier() - 1) * 100);
  el.prestige.textContent = `${state.prestigePoints} (+${bonusPct}%)`;
}

function renderTabs() {
  el.tabs.innerHTML = '';
  MINES.forEach((cfg, i) => {
    const mine = state.mines[i];
    const tab = document.createElement('button');
    tab.className = 'mine-tab' + (i === state.activeMineIndex ? ' active' : '') + (!mine.unlocked ? ' locked' : '');
    if (mine.unlocked) {
      tab.innerHTML = `${cfg.icon} ${cfg.name}<span class="tab-cps">${formatCash(mineCashPerSecond(i))}/s</span>`;
      tab.addEventListener('click', () => { state.activeMineIndex = i; renderAll(); });
    } else {
      tab.innerHTML = `🔒 ${cfg.name}<span class="tab-cps">${formatCash(cfg.unlockCost)}</span>`;
      tab.disabled = state.cash < 0; // always clickable to attempt purchase
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
  spawnConfetti(70);
  screenShake();
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

    const row = document.createElement('div');
    row.className = 'floor-row' + (floor.manager ? ' managed' : '');

    const isWarn = !floor.manager && fillPct >= 85;
    const barClass = 'floor-bar' + (floor.manager ? ' managed' : '') + (isWarn ? ' warn' : '');

    row.innerHTML = `
      <div class="floor-icon">${FLOOR_ICONS[floorIdx % FLOOR_ICONS.length]}</div>
      <div class="floor-main">
        <div class="floor-name-row">
          <b>Schacht ${floorIdx + 1} · Lv.${floor.level}</b>
          <span>${formatNumber(rate)} Erz/s</span>
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

  // upgrade buttons
  el.floorsList.querySelectorAll('[data-upgrade]').forEach(btn => {
    const fi = parseInt(btn.getAttribute('data-upgrade'), 10);
    const cost = floorUpgradeCost(mineIdx, fi, mine.floors[fi].level);
    btn.disabled = state.cash < cost;
    if (!btn.disabled) btn.classList.add('ready-pulse');
    btn.addEventListener('click', (ev) => upgradeFloor(mineIdx, fi, ev));
  });
  // manager buttons
  el.floorsList.querySelectorAll('[data-manager]').forEach(btn => {
    const fi = parseInt(btn.getAttribute('data-manager'), 10);
    const cost = floorManagerCost(mineIdx, fi);
    btn.disabled = state.cash < cost;
    if (!btn.disabled) btn.classList.add('ready-pulse');
    btn.addEventListener('click', (ev) => buyManager(mineIdx, fi, ev));
  });
  // collect bars
  el.floorsList.querySelectorAll('[data-collect]').forEach(bar => {
    const fi = parseInt(bar.getAttribute('data-collect'), 10);
    bar.addEventListener('click', (ev) => collectFloor(mineIdx, fi, ev));
  });

  // unlock next floor row
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
}

function renderElevator() {
  const mineIdx = state.activeMineIndex;
  const mine = state.mines[mineIdx];
  const throughput = elevatorThroughput(mineIdx, mine.elevatorLevel);
  const cap = throughput * 20; // visual cap reference (20s of throughput)
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
}

/* =========================================================
   Actions
   ========================================================= */

function upgradeFloor(mineIdx, floorIdx, ev) {
  const mine = state.mines[mineIdx];
  const floor = mine.floors[floorIdx];
  const cost = floorUpgradeCost(mineIdx, floorIdx, floor.level);
  if (state.cash < cost) { shake(ev.currentTarget); return; }
  state.cash -= cost;
  floor.level++;
  addRipple(ev.currentTarget, ev);
  spawnOreParticles(ev.clientX, ev.clientY, 5);
  if (floor.level % 10 === 0) { spawnConfetti(24); screenShake(); }
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
  addRipple(ev.currentTarget, ev);
  spawnConfetti(20);
  renderAll();
}

function unlockFloor(mineIdx, floorIdx, ev) {
  const mine = state.mines[mineIdx];
  const cost = floorUnlockCost(mineIdx, floorIdx);
  if (state.cash < cost) return;
  state.cash -= cost;
  mine.floors[floorIdx].unlocked = true;
  if (ev) addRipple(ev.currentTarget, ev);
  spawnConfetti(26);
  screenShake();
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
  if (mine.elevatorLevel % 5 === 0) { spawnConfetti(24); screenShake(); }
  renderAll();
}

function collectFloor(mineIdx, floorIdx, ev) {
  const mine = state.mines[mineIdx];
  const floor = mine.floors[floorIdx];
  if (floor.manager) return; // managed floors auto-collect
  if (floor.buffer <= 0) return;
  // instantly hand off to elevator queue (elevator throughput still gates conversion to cash over time)
  mine.elevatorQueue += floor.buffer;
  spawnFloatText(ev.clientX, ev.clientY, `+${formatNumber(floor.buffer)} Erz`);
  spawnOreParticles(ev.clientX, ev.clientY, 6 + Math.floor(Math.random() * 4));
  popCash();
  addFrenzy(FRENZY_PER_CLICK);
  floor.buffer = 0;
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
    addFrenzy(FRENZY_PER_COLLECT_ALL);
    renderAll();
  }
}

/* =========================================================
   Prestige
   ========================================================= */

function openPrestigeModal() {
  const gain = potentialPrestigeGain();
  document.getElementById('prestige-gain').textContent = gain;
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
  const lifetime = state.lifetimeCashEarned;
  state = freshState();
  state.lifetimeCashEarned = lifetime;
  state.prestigePoints += gain; // note: freshState sets 0, so this equals gain, kept explicit for clarity
  frenzyMeter = 0;
  goldrushActive = false;
  document.body.classList.remove('goldrush-active');
  document.getElementById('goldrush-banner').classList.add('hidden');
  closePrestigeModal();
  prestigeCelebration();
  renderAll();
  save();
}

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
  for (let i = 0; i < count; i++) {
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
  for (let i = 0; i < count; i++) {
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

let lastElevatorParticle = 0;
function maybeSpawnElevatorParticle(nowMs) {
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

let saveFlashTimeout = null;
function flashSaved() {
  el.saveIndicator.textContent = 'Gespeichert ✓';
  clearTimeout(saveFlashTimeout);
  saveFlashTimeout = setTimeout(() => { el.saveIndicator.textContent = 'Automatisches Speichern aktiv'; }, 1500);
}

/* =========================================================
   Boot
   ========================================================= */

function showOfflineModalIfNeeded() {
  const elapsed = (Date.now() - state.lastSave) / 1000;
  if (elapsed < 10) return;
  const earned = simulateOffline(elapsed);
  if (earned <= 0) return;
  addCash(earned);
  const hours = Math.floor(Math.min(elapsed, OFFLINE_CAP_SECONDS) / 3600);
  const minutes = Math.floor((Math.min(elapsed, OFFLINE_CAP_SECONDS) % 3600) / 60);
  document.getElementById('offline-text').textContent =
    `Deine Manager haben ${hours}h ${minutes}min lang weitergearbeitet.`;
  document.getElementById('offline-earnings').textContent = `+${formatCash(earned)}`;
  document.getElementById('offline-modal').classList.remove('hidden');
}

function init() {
  load();
  showOfflineModalIfNeeded();
  renderAll();

  el.collectAllBtn.addEventListener('click', collectAll);
  document.getElementById('prestige-open-btn').addEventListener('click', openPrestigeModal);
  document.getElementById('prestige-cancel-btn').addEventListener('click', closePrestigeModal);
  document.getElementById('prestige-confirm-btn').addEventListener('click', doPrestige);
  document.getElementById('offline-close-btn').addEventListener('click', () => {
    document.getElementById('offline-modal').classList.add('hidden');
    renderAll();
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Wirklich den kompletten Spielstand löschen? Das kann nicht rückgängig gemacht werden.')) {
      localStorage.removeItem(SAVE_KEY);
      state = freshState();
      renderAll();
    }
  });

  let lastTick = performance.now();
  setInterval(() => {
    const now = performance.now();
    const dt = (now - lastTick) / 1000;
    lastTick = now;
    tick(dt);
    updateGoldrush(now);
    if (frenzyMeter > 0) {
      frenzyMeter = Math.max(0, frenzyMeter - FRENZY_DECAY_PER_SEC * dt);
      renderFrenzy();
    }
    maybeSpawnElevatorParticle(now);
    renderTopbar();
    renderElevator();
    // lightweight refresh of floor bars without full re-render for perf
    updateFloorBarsOnly();
  }, TICK_MS);

  setInterval(save, AUTOSAVE_MS);
  window.addEventListener('beforeunload', save);
}

function updateFloorBarsOnly() {
  const mineIdx = state.activeMineIndex;
  const mine = state.mines[mineIdx];
  const bars = el.floorsList.querySelectorAll('.floor-bar-fill');
  const rows = el.floorsList.querySelectorAll('.floor-row');
  let visibleFloorIdx = -1;
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
  });
}

init();
