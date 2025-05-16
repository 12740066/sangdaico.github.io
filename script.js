let players = [];
let numHoles = 18;
let currentHole = 1;
let scores = {};
let seoData = {};
let birdieData = {};
let chipInData = {};

function startGame() {
  players = document.getElementById('playersInput').value.split(',').map(p => p.trim());
  for (let p of players) {
    scores[p] = Array(numHoles).fill(0);
    seoData[p] = Array(numHoles).fill(0);
    birdieData[p] = Array(numHoles).fill(false);
    chipInData[p] = Array(numHoles).fill(false);
  }
  document.getElementById('setup').style.display = 'none';
  document.getElementById('scorecard').style.display = 'block';
  renderHole();
}

function renderHole() {
  document.getElementById('holeTitle').innerText = `Hole ${currentHole}`;
  const container = document.getElementById('holeControls');
  container.innerHTML = '';
  for (let p of players) {
    container.innerHTML += `
      <div class="player-score">
        <div>${p}</div>
        <div>
          <button onclick="changeScore('${p}', -1)">−</button>
          <span id="${p}-score">${scores[p][currentHole - 1]}</span>
          <button onclick="changeScore('${p}', 1)">+</button>
        </div>
        <div>
          <label>Seo: <input type="number" id="${p}-seo" value="${seoData[p][currentHole - 1]}" /></label>
          <label><input type="checkbox" id="${p}-birdie" ${birdieData[p][currentHole - 1] ? 'checked' : ''}/> Birdie</label>
          <label><input type="checkbox" id="${p}-chipin" ${chipInData[p][currentHole - 1] ? 'checked' : ''}/> Chip-in</label>
        </div>
      </div>
    `;
  }
}

function changeScore(player, delta) {
  scores[player][currentHole - 1] += delta;
  if (scores[player][currentHole - 1] < 0) scores[player][currentHole - 1] = 0;
  document.getElementById(`${player}-score`).innerText = scores[player][currentHole - 1];
}

function saveCurrentHole() {
  for (let p of players) {
    seoData[p][currentHole - 1] = parseInt(document.getElementById(`${p}-seo`).value) || 0;
    birdieData[p][currentHole - 1] = document.getElementById(`${p}-birdie`).checked;
    chipInData[p][currentHole - 1] = document.getElementById(`${p}-chipin`).checked;
  }
}

function nextHole() {
  saveCurrentHole();
  if (currentHole < numHoles) {
    currentHole++;
    renderHole();
  }
}

function prevHole() {
  saveCurrentHole();
  if (currentHole > 1) {
    currentHole--;
    renderHole();
  }
}

function calculateTotal() {
  saveCurrentHole();
  let result = {};
  let skinAmount = 5, seoPenalty = 1, birdieReward = 2, chipInReward = 3;

  players.forEach(p => result[p] = 0);

  for (let h = 0; h < numHoles; h++) {
    let strokes = {};
    players.forEach(p => strokes[p] = scores[p][h]);
    let minStrokes = Math.min(...Object.values(strokes));
    let skinWinners = players.filter(p => strokes[p] === minStrokes);

    players.forEach(p => {
      let total = 0;
      total -= seoData[p][h] * seoPenalty;
      if (birdieData[p][h]) total += birdieReward;
      if (chipInData[p][h]) total += chipInReward;

      if (skinWinners.length === 1 && skinWinners[0] === p) {
        total += (players.length - 1) * skinAmount;
      } else if (!skinWinners.includes(p)) {
        total -= skinAmount;
      }

      result[p] += total;
    });
  }

  let resultDiv = document.getElementById('results');
  resultDiv.innerHTML = '<h2>Results</h2>';
  players.forEach(p => {
    resultDiv.innerHTML += `<p>${p}: $${result[p]}</p>`;
  });
}
