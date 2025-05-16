// --- Global variables ---
let numPlayers = 4;
let skinValue = 5;
const maxHoles = 18;
let currentHole = 1;

let playerNames = [];
let playerHandicaps = [];
// Data structure: For each player, an array of 18 values (holes)
let strokesData = [];
let bonusData = [];
let penaltyData = [];
let moneyThisHole = [];
let totalMoney = [];

const setupDiv = document.getElementById('setup');
const gameDiv = document.getElementById('game');

const playersMinusBtn = document.getElementById('players-minus');
const playersPlusBtn = document.getElementById('players-plus');
const playersNumInput = document.getElementById('players-num');

const skinMinusBtn = document.getElementById('skin-minus');
const skinPlusBtn = document.getElementById('skin-plus');
const skinInput = document.getElementById('skin-value');

const startGameBtn = document.getElementById('start-game');

const prevHoleBtn = document.getElementById('prev-hole');
const nextHoleBtn = document.getElementById('next-hole');

const currentHoleSpan = document.getElementById('current-hole');
const scoreBody = document.getElementById('score-body');

// --- Utility functions ---

function saveToStorage() {
  const data = {
    numPlayers,
    skinValue,
    currentHole,
    playerNames,
    playerHandicaps,
    strokesData,
    bonusData,
    penaltyData,
    totalMoney,
  };
  localStorage.setItem('golfBetData', JSON.stringify(data));
}

function loadFromStorage() {
  const data = localStorage.getItem('golfBetData');
  if(data) {
    const parsed = JSON.parse(data);
    numPlayers = parsed.numPlayers;
    skinValue = parsed.skinValue;
    currentHole = parsed.currentHole;
    playerNames = parsed.playerNames;
    playerHandicaps = parsed.playerHandicaps;
    strokesData = parsed.strokesData;
    bonusData = parsed.bonusData;
    penaltyData = parsed.penaltyData;
    totalMoney = parsed.totalMoney;
    return true;
  }
  return false;
}

function initPlayerData() {
  playerNames = [];
  playerHandicaps = [];
  strokesData = [];
  bonusData = [];
  penaltyData = [];
  totalMoney = new Array(numPlayers).fill(0);
  for(let i=0; i<numPlayers; i++) {
    playerNames.push(`Player ${i+1}`);
    playerHandicaps.push(0);
    strokesData.push(new Array(maxHoles).fill(0));
    bonusData.push(new Array(maxHoles).fill(0));
    penaltyData.push(new Array(maxHoles).fill(0));
  }
}

function updateCurrentHoleUI() {
  currentHoleSpan.textContent = currentHole;
}

function updatePlayersNumInput() {
  playersNumInput.value = numPlayers;
}

function updateSkinValueInput() {
  skinInput.value = skinValue;
}

// --- Event handlers for setup ---

playersMinusBtn.onclick = () => {
  if(numPlayers > 1) {
    numPlayers--;
    updatePlayersNumInput();
  }
};
playersPlusBtn.onclick = () => {
  if(numPlayers < 8) {
    numPlayers++;
    updatePlayersNumInput();
  }
};
playersNumInput.onchange = () => {
  let val = parseInt(playersNumInput.value);
  if(isNaN(val) || val < 1) val = 1;
  if(val > 8) val = 8;
  numPlayers = val;
  updatePlayersNumInput();
};

skinMinusBtn.onclick = () => {
  if(skinValue > 1) {
    skinValue--;
    updateSkinValueInput();
  }
};
skinPlusBtn.onclick = () => {
  skinValue++;
  updateSkinValueInput();
};
skinInput.onchange = () => {
  let val = parseInt(skinInput.value);
  if(isNaN(val) || val < 1) val = 1;
  skinValue = val;
  updateSkinValueInput();
};

startGameBtn.onclick = () => {
  initPlayerData();
  currentHole = 1;
  saveToStorage();
  setupDiv.style.display = 'none';
  gameDiv.style.display = 'block';
  updateCurrentHoleUI();
  renderScoreTable();
  calculateAllMoney();
  updateTotalsUI();
};

// --- Navigation buttons ---

prevHoleBtn.onclick = () => {
  if(currentHole > 1) {
    currentHole--;
    updateCurrentHoleUI();
    renderScoreTable();
    calculateAllMoney();
    updateTotalsUI();
    saveToStorage();
  }
};

nextHoleBtn.onclick = () => {
  if(currentHole < maxHoles) {
    currentHole++;
    updateCurrentHoleUI();
    renderScoreTable();
    calculateAllMoney();
    updateTotalsUI();
    saveToStorage();
  }
};

// --- Render the table with controls ---

function renderScoreTable() {
  scoreBody.innerHTML = '';

  for(let i=0; i<numPlayers; i++) {
    const tr = document.createElement('tr');

    // Player Name
    const tdName = document.createElement('td');
    tdName.textContent = playerNames[i];
    tr.appendChild(tdName);

    // Handicap Compensation (calculated relative to player 1)
    const tdHc = document.createElement('td');
    if(i === 0) {
      tdHc.textContent = 0;
    } else {
      const comp = ((playerHandicaps[i] - playerHandicaps[0]) * 0.7).toFixed(2);
      tdHc.textContent = comp >= 0 ? `+${comp}` : comp;
    }
    tr.appendChild(tdHc);

    // Strokes control
    const tdStrokes = document.createElement('td');
    tdStrokes.appendChild(createNumberControl(i, 'stroke'));
    tr.appendChild(tdStrokes);

    // Bonus control
    const tdBonus = document.createElement('td');
    tdBonus.appendChild(createNumberControl(i, 'bonus'));
    tr.appendChild(tdBonus);

    // Penalty control
    const tdPenalty = document.createElement('td');
    tdPenalty.appendChild(createNumberControl(i, 'penalty'));
    tr.appendChild(tdPenalty);

    // Money This Hole
    const tdMoneyThis = document.createElement('td');
    tdMoneyThis.id = `money-hole-${i}`;
    tdMoneyThis.textContent = '$0';
    tr.appendChild(tdMoneyThis);

    // Total Money
    const tdTotalMoney = document.createElement('td');
    tdTotalMoney.id = `money-total-${i}`;
    tdTotalMoney.textContent = '$0';
    tr.appendChild(tdTotalMoney);

    scoreBody.appendChild(tr);
  }
}

// Create the number control with +/- buttons and numeric input
function createNumberControl(playerIdx, type) {
  const container = document.createElement('div');
  container.className = 'number-control';

  const minusBtn = document.createElement('button');
  minusBtn.type = 'button';
  minusBtn.textContent = '-';
  minusBtn.onclick = () => {
    updateValue(playerIdx, type, -1);
  };

  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.value = getCurrentValue(playerIdx, type);
  input.style.width = '50px';
  input.onchange = () => {
    let val = parseInt(input.value);
    if(isNaN(val) || val < 0) val = 0;
    input.value = val;
    setCurrentValue(playerIdx, type, val);
    calculateAllMoney();
    updateTotalsUI();
    saveToStorage();
  };

  const plusBtn = document.createElement('button');
  plusBtn.type = 'button';
  plusBtn.textContent = '+';
  plusBtn.onclick = () => {
    updateValue(playerIdx, type, 1);
  };

  container.appendChild(minusBtn);
  container.appendChild(input);
  container.appendChild(plusBtn);

  return container;
}

function getCurrentValue(playerIdx, type) {
  if(type === 'stroke') return strokesData[playerIdx][currentHole -1];
  if(type === 'bonus') return bonusData[playerIdx][currentHole -1];
  if(type === 'penalty') return penaltyData[playerIdx][currentHole -1];
  return 0;
}

function setCurrentValue(playerIdx, type, val) {
  if(type === 'stroke') strokesData[playerIdx][currentHole -1] = val;
  else if(type === 'bonus') bonusData[playerIdx][currentHole -1] = val;
  else if(type === 'penalty') penaltyData[playerIdx][currentHole -1] = val;
}

function updateValue(playerIdx, type, delta) {
  let val = getCurrentValue(playerIdx, type) + delta;
  if(val < 0) val = 0;
  setCurrentValue(playerIdx, type, val);
  renderScoreTable();
  calculateAllMoney();
  updateTotalsUI();
  saveToStorage();
}

// --- Calculation logic ---

function calculateAllMoney() {
  moneyThisHole = new Array(numPlayers).fill(0);

  // Calculate strokes differences for skin calculation
  for(let i=0; i<numPlayers; i++) {
    let sum = 0;
    for(let j=0; j<numPlayers; j++) {
      if(i === j) continue;
      const diff = strokesData[i][currentHole-1] - strokesData[j][currentHole-1];
      // Apply formula:
      // sum += -(diff) + 1 but capped to +1, 0, or -1 per your logic
      let val = 0;
      if(-diff > 0) val = 1;
      else if(-diff < 0) val = -1;
      else val = 0;
      sum += val;
    }
    // sum is net win/loss count of hole vs other players
    // multiply by skin value
    moneyThisHole[i] = sum * skinValue;
  }

  // Add bonus and penalty money
  for(let i=0; i<numPlayers; i++) {
    moneyThisHole[i] += bonusData[i][currentHole-1] * skinValue;
    moneyThisHole[i] -= penaltyData[i][currentHole-1] * skinValue;
  }

  // Update totalMoney array
  for(let i=0; i<numPlayers; i++) {
    if(typeof totalMoney[i] !== 'number') totalMoney[i] = 0;
    totalMoney[i] += moneyThisHole[i];
  }
}

// --- Update the money UI ---

function updateTotalsUI() {
  for(let i=0; i<numPlayers; i++) {
    const holeElem = document.getElementById(`money-hole-${i}`);
    const totalElem = document.getElementById(`money-total-${i}`);
    if(holeElem) holeElem.textContent = `$${moneyThisHole[i].toFixed(2)}`;
    if(totalElem) totalElem.textContent = `$${totalMoney[i].toFixed(2)}`;
  }
}

// --- Initialization ---

function start() {
  if(loadFromStorage()) {
    // Data loaded
    setupDiv.style.display = 'none';
    gameDiv.style.display = 'block';
    updateCurrentHoleUI();
    renderScoreTable();
    updateTotalsUI();
  } else {
    setupDiv.style.display = 'block';
    gameDiv.style.display = 'none';
    updatePlayersNumInput();
    updateSkinValueInput();
  }
}

start();
