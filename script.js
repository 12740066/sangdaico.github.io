let players = [];
let scores = {};
let bonusData = {};
let penaltyData = {};
let handicaps = {};
let handicapAdjustments = {};
let currentHole = 1;
let skinValue = 5;

function generatePlayerInputs() {
  const count = parseInt(document.getElementById('playerCount').value);
  const container = document.getElementById('playerInputs');
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    container.innerHTML += `
      <div>
        <label>Player ${i+1} Name: <input id="pname${i}" /></label>
        <label>Handicap: <input id="phcap${i}" type="number" /></label>
      </div>
    `;
  }
}

function startGame() {
  skinValue = parseFloat(document.getElementById('skinValue').value || '5');
  const count = parseInt(document.getElementById('playerCount').value);
  players = [];
  scores = {};
  bonusData = {};
  penaltyData = {};
  handicaps = {};

  for (let i = 0; i < count; i++) {
    const name = document.getElementById(`pname${i}`).value || `Player ${i+1}`;
    const hcap = parseInt(document.getElementById(`phcap${i}`).value) || 0;
    players.push(name);
    handicaps[name] = hcap;
    scores[name] = Array(18).fill(0);
    bonusData[name] = Array(18).fill(0);
    penaltyData[name] = Array(18).fill(0);
  }

  calculateHandicapCompensation();
  document.querySelector('.setup').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  renderHole();
}

function calculateHandicapCompensation() {
  handicapAdjustments = {};
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const p1 = players[i];
      const p2 = players[j];
      const h1 = handicaps[p1];
      const h2 = handicaps[p2];
      const diff = Math.abs(h1 - h2);
      const comp = Math.round(diff * 0.7 * skinValue);
      const high = h1 > h2 ? p1 : p2;
      const low = h1 > h2 ? p2 : p1;
      handicapAdjustments[high] = (handicapAdjustments[high] || 0);
      handicapAdjustments[low] = (handicapAdjustments[low] || 0) + comp;
      handicapAdjustments[high] -= comp;
    }
  }
}

function renderHole() {
  document.getElementById('holeNum').innerText = currentHole;
  const container = document.getElementById('scoreInputs');
  container.innerHTML = '';

  const earnings = calculateHoleEarnings(currentHole - 1);

  players.forEach(player => {
    container.innerHTML += `
      <div class="player-row">
        <strong>${player}</strong><br>
        Strokes: 
        <button onclick="changeScore('${player}', -1)">−</button> 
        ${scores[player][currentHole - 1]} 
        <button onclick="changeScore('${player}', 1)">+</button>

        Bonus: 
        <button onclick="changeBonus('${player}', -1)">−</button> 
        ${bonusData[player][currentHole - 1]} 
        <button onclick="changeBonus('${player}', 1)">+</button>

        Penalty: 
        <button onclick="changePenalty('${player}', -1)">−</button> 
        ${penaltyData[player][currentHole - 1]} 
        <button onclick="changePenalty('${player}', 1)">+</button>

        <br><em>This Hole: $${earnings[player]}</em>
      </div>
    `;
  });

  renderEarnings();
}

function changeScore(player, delta) {
  let val = scores[player][currentHole - 1];
  val += delta;
  if (val < 0) val = 0;
  scores[player][currentHole - 1] = val;
  renderHole();
}

function changeBonus(player, delta) {
  let val = bonusData[player][currentHole - 1] || 0;
  val += delta;
  if (val < 0) val = 0;
  bonusData[player][currentHole - 1] = val;
  renderHole();
}

function changePenalty(player, delta) {
  let val = penaltyData[player][currentHole - 1] || 0;
  val += delta;
  if (val < 0) val = 0;
  penaltyData[player][currentHole - 1] = val;
  renderHole();
}

function prevHole() {
  if (currentHole > 1) {
    currentHole--;
    renderHole();
  }
}

function nextHole() {
  if (currentHole < 18) {
    currentHole++;
    renderHole();
  }
}

function calculateHoleEarnings(holeIndex) {
  let earnings = {};
  players.forEach(p => earnings[p] = 0);

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const p1 = players[i];
      const p2 = players[j];
      const s1 = scores[p1][holeIndex];
      const s2 = scores[p2][holeIndex];
      if (s1 === s2) continue;
      const winner = s1 < s2 ? p1 : p2;
      const loser = s1 < s2 ? p2 : p1;
      const diff = Math.abs(s1 - s2);
      const value = skinValue + (diff * skinValue);
      earnings[winner] += value;
      earnings[loser] -= value;
    }
  }

  players.forEach(p => {
    const b = bonusData[p][holeIndex] || 0;
    const pen = penaltyData[p][holeIndex] || 0;
    earnings[p] += (b - pen) * skinValue;
  });

  return earnings;
}

function renderEarnings() {
  const totalEarnings = {};
  players.forEach(p => totalEarnings[p] = 0);

  for (let h = 0; h < 18; h++) {
    const holeEarnings = calculateHoleEarnings(h);
    players.forEach(p => totalEarnings[p] += holeEarnings[p]);
  }

  players.forEach(p => {
    totalEarnings[p] += (handicapAdjustments[p] || 0);
  });

  const list = document.getElementById('earningsList');
  list.innerHTML = '';
  players.forEach(p => {
    list.innerHTML += `<li><strong>${p}</strong>: $<span id="${p}-total">${totalEarnings[p]}</span></li>`;
  });
}
