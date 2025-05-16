// Setup variables
let numPlayers = 4;
let skinValue = 5;
let currentHole = 1;
const maxHoles = 18;

// Data arrays
let playerNames = [];
let playerHandicaps = [];
let strokesData = [];
let bonusData = [];
let penaltyData = [];
let moneyThisHole = [];
let totalMoney = [];
let handicapCompensation = [];

const setupDiv = document.getElementById('setup');
const playersSetupDiv = document.getElementById('players-setup');
const playersListDiv = document.getElementById('players-list');
const gameDiv = document.getElementById('game');
const playersCountSpan = document.getElementById('players-count');
const skinValueSpan = document.getElementById('skin-value');
const currentHoleSpan = document.getElementById('current-hole');
const scoreBody = document.getElementById('score-body');

// Number players controls
document.getElementById('players-plus').onclick = () => {
  if(numPlayers < 8) {
    numPlayers++;
    playersCountSpan.textContent = numPlayers;
  }
};
document.getElementById('players-minus').onclick = () => {
  if(numPlayers > 2) {
    numPlayers--;
    playersCountSpan.textContent = numPlayers;
  }
};

// Skin value controls
document.getElementById('skin-plus').onclick = () => {
  skinValue++;
  skinValueSpan.textContent = skinValue;
};
document.getElementById('skin-minus').onclick = () => {
  if(skinValue > 1) {
    skinValue--;
    skinValueSpan.textContent = skinValue;
  }
};

// Start button
document.getElementById('start-btn').onclick = () => {
  setupDiv.style.display = 'none';
  playersSetupDiv.style.display = 'block';
  buildPlayerInputs();
};

// Build player name and handicap input fields
function buildPlayerInputs() {
  playersListDiv.innerHTML = '';
  for(let i=0; i<numPlayers; i++) {
    const div = document.createElement('div');
    div.innerHTML = `
      Player ${i+1} Name: <input type="text" id="name-${i}" value="Player ${i+1}" />
      Handicap: <input type="number" min="0" max="54" step="1" id="handicap-${i}" value="20" />
    `;
    playersListDiv.appendChild(div);
  }
}

// Begin game button
document.getElementById('begin-game-btn').onclick = () => {
  // Read names and handicaps
  playerNames = [];
  playerHandicaps = [];
  for(let i=0; i<numPlayers; i++) {
    const name = document.getElementById(`name-${i}`).value.trim() || `Player ${i+1}`;
    const hc = parseInt(document.getElementById(`handicap-${i}`).value) || 0;
    playerNames.push(name);
    playerHandicaps.push(hc);
  }

  // Initialize data arrays for each player and hole
  strokesData = Array(numPlayers).fill().map(() => Array(maxHoles).fill(0));
  bonusData = Array(numPlayers).fill().map(() => Array(maxHoles).fill(0));
  penaltyData = Array(numPlayers).fill().map(() => Array(maxHoles).fill(0));
  moneyThisHole = Array(numPlayers).fill().map(() => Array(maxHoles).fill(0));
  totalMoney = Array(numPlayers).fill(0);
  handicapCompensation = Array(numPlayers).fill(0);

  playersSetupDiv.style.display = 'none';
  gameDiv.style.display = 'block';

  currentHole = 1;
  updateHoleUI();
  renderScoreTable();
  loadFromStorage();
  calculateAllMoney();
  updateTotalsUI();
};

// Render the score table body for current hole
function renderScoreTable() {
  scoreBody.innerHTML = '';
  for(let i=0; i<numPlayers; i++) {
    const tr = document.createElement('tr');

    // Player name
    const tdName = document.createElement('td');
    tdName.textContent = playerNames[i];
    tr.appendChild(tdName);

    // Handicap
    const tdHc = document.createElement('td');
    tdHc.textContent = playerHandicaps[i];
    tr.appendChild(tdHc);

    // Strokes with +/- buttons
    const tdStrokes = document.createElement('td');
    tdStrokes.appendChild(createNumberControl(i, 'stroke'));
    tr.appendChild(tdStrokes);

    // Bonus
    const tdBonus = document.createElement('td');
    tdBonus.appendChild(createNumberControl(i, 'bonus'));
    tr.appendChild(tdBonus);

    // Penalty
    const tdPenalty = document.createElement('td');
    tdPenalty.appendChild(createNumberControl(i, 'penalty'));
    tr.appendChild(tdPenalty);

    // Money this hole
    const tdMoneyThis = document.createElement('td');
    tdMoneyThis.id = `money-hole-${i}`;
    tdMoneyThis.textContent = '$0';
    tr.appendChild(tdMoneyThis);

    // Total money
    const tdTotalMoney = document.createElement('td');
    tdTotalMoney.id = `money-total-${i}`;
    tdTotalMoney.textContent = '$0';
    tr.appendChild(tdTotalMoney);

    scoreBody.appendChild(tr);
  }
}

// Create +/- buttons and number display for inputs
function createNumberControl(playerIdx, type) {
  const container = document.createElement('div');
  container.className = 'number-control';

  const minusBtn = document.createElement('button');
  minusBtn.textContent = '-';
  minusBtn.onclick = () => {
    updateValue(playerIdx, type, -1);
  };

  const numberSpan = document.createElement('span');
  numberSpan.id = `${type}-${playerIdx}`;
  numberSpan.textContent = '0';

  const plusBtn = document.createElement('button');
  plusBtn.textContent = '+';
  plusBtn.onclick = () => {
    updateValue(playerIdx, type, +1);
  };

  container.appendChild(minusBtn);
  container.appendChild(numberSpan);
  container.appendChild(plusBtn);

  return container;
}

// Update values and recalc money
function updateValue(playerIdx, type, delta) {
  let arr;
  if(type === 'stroke') arr = strokesData;
  else if(type === 'bonus') arr = bonusData;
  else if(type === 'penalty') arr = penaltyData;

  let val = arr[playerIdx][currentHole-1] + delta;
  if(val < 0) val = 0;
  arr[playerIdx][currentHole-1] = val;

  document.getElementById(`${type}-${playerIdx}`).textContent = val;
  saveToStorage();
  calculateAllMoney();
  updateTotalsUI();
}

// Update UI to show current hole and current values
function updateHoleUI() {
  currentHoleSpan.textContent = `Hole ${currentHole}`;

  for(let i=0; i<numPlayers; i++) {
    document.getElementById(`stroke-${i}`).textContent = strokesData[i][currentHole-1];
    document.getElementById(`bonus-${i}`).textContent = bonusData[i][currentHole-1];
    document.getElementById(`penalty-${i}`).textContent = penaltyData[i][currentHole-1];
  }
}

// Next/Prev hole buttons
document.getElementById('next-hole').onclick = () => {
  if(currentHole < maxHoles) {
    currentHole++;
    updateHoleUI();
  }
};
document.getElementById('prev-hole').onclick = () => {
  if(currentHole > 1) {
    currentHole--;
    updateHoleUI();
  }
};

// Calculate Handicap Compensation for each player relative to others
function calculateHandicapCompensation() {
  // Each player vs others: comp = sum of (otherHandicap - playerHandicap)*0.7
  for(let i=0; i<numPlayers; i++) {
    let comp = 0;
    for(let j=0; j<numPlayers; j++) {
      if(i !== j) {
        comp += (playerHandicaps[j] - playerHandicaps[i]) * 0.7;
      }
    }
    handicapCompensation[i] = comp;
  }
}

// Calculate money for each player for the current hole based on logic
function calculateMoneyForHole(hole) {
  for(let i=0; i<numPlayers; i++) moneyThisHole[i][hole-1] = 0;

  for(let i=0; i<numPlayers; i++) {
    let strokeScoreSum = 0;
    for(let j=0; j<numPlayers; j++) {
      if(i !== j){
        let diff = strokesData[j][hole-1] - strokesData[i][hole-1];
        if(diff < 0) strokeScoreSum += 1;    // player wins vs opponent
        else if(diff > 0) strokeScoreSum += -1; // player loses vs opponent
        else strokeScoreSum += 0; // tie
      }
    }
    let strokeMoney = skinValue * strokeScoreSum;

    let oppCount = numPlayers - 1;
    let bonusPenaltyMoney = skinValue * oppCount * (bonusData[i][hole-1] - penaltyData[i][hole-1]);

    moneyThisHole[i][hole-1] = strokeMoney + bonusPenaltyMoney;
  }
}

// Calculate all holes total money and update moneyThisHole for all holes
function calculateAllMoney() {
  calculateHandicapCompensation();

  for(let hole=1; hole<=maxHoles; hole++) {
    calculateMoneyForHole(hole);
  }

  // Sum total money per player
  for(let i=0; i<numPlayers; i++) {
    totalMoney[i] = 0;
    for(let hole=0; hole<maxHoles; hole++) {
      totalMoney[i] += moneyThisHole[i][hole];
    }
  }
}

// Update money columns in UI for current hole and total
function updateTotalsUI() {
  for(let i=0; i<numPlayers; i++) {
    const moneyThis = moneyThisHole[i][currentHole-1];
    const moneyTotal = totalMoney[i];

    const moneyThisElem = document.getElementById(`money-hole-${i}`);
    const moneyTotalElem = document.getElementById(`money-total-${i}`);

    moneyThisElem.textContent = (moneyThis >= 0 ? '+$' : '-$') + Math.abs(moneyThis).toFixed(2);
    moneyThisElem.className = moneyThis >= 0 ? 'money-positive' : 'money-negative';

    moneyTotalElem.textContent = (moneyTotal >= 0 ? '+$' : '-$') + Math.abs(moneyTotal).toFixed(2);
    moneyTotalElem.className = moneyTotal >= 0 ? 'money-positive' : 'money-negative';
  }
}

// Local storage keys
const STORAGE_KEY = 'golfBetCalculatorData';

// Save game state to localStorage
function saveToStorage() {
  const data = {
    numPlayers,
    skinValue,
    playerNames,
    playerHandicaps,
    strokesData,
    bonusData,
    penaltyData,
    moneyThisHole,
    totalMoney,
    currentHole
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Load game state from localStorage
function loadFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved) {
    const data = JSON.parse(saved);
    if(data.numPlayers === numPlayers) {
      skinValue = data.skinValue;
      playerNames = data.playerNames;
      playerHandicaps = data.playerHandicaps;
      strokesData = data.strokesData;
      bonusData = data.bonusData;
      penaltyData = data.penaltyData;
      moneyThisHole = data.moneyThisHole;
      totalMoney = data.totalMoney;
      currentHole = data.currentHole;

      skinValueSpan.textContent = skinValue;
      playersCountSpan.textContent = numPlayers;

      // Show game UI directly if loaded
      setupDiv.style.display = 'none';
      playersSetupDiv.style.display = 'none';
      gameDiv.style.display = 'block';

      renderScoreTable();
      updateHoleUI();
      updateTotalsUI();
    }
  }
}
