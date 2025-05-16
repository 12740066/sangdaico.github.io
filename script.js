let players = [];
let numHoles = 18;
let bettingRules = {
  seoPenalty: 1,
  birdieReward: 2,
  chipInReward: 3,
  skinAmount: 5
};

function startGame() {
  const input = document.getElementById('playersInput').value;
  players = input.split(',').map(p => p.trim()).filter(p => p);
  renderForm();
}

function renderForm() {
  const container = document.getElementById('gameContainer');
  container.innerHTML = '';

  players.forEach(player => {
    const section = document.createElement('div');
    section.className = 'player-section';
    section.innerHTML = `<h2>${player}</h2>`;

    for (let i = 1; i <= numHoles; i++) {
      section.innerHTML += `
        <div>
          <span class="hole-label">Hole ${i}:</span>
          Strokes <input type="number" id="${player}-strokes-${i}" />
          Seo <input type="number" id="${player}-seo-${i}" />
          Birdie <input type="checkbox" id="${player}-birdie-${i}" />
          Chip-in <input type="checkbox" id="${player}-chipin-${i}" />
        </div>`;
    }

    container.appendChild(section);
  });
}

function calculateTotal() {
  const results = {};
  players.forEach(p => results[p] = 0);

  for (let hole = 1; hole <= numHoles; hole++) {
    let strokes = {};
    players.forEach(player => {
      const s = parseInt(document.getElementById(`${player}-strokes-${hole}`).value) || 0;
      strokes[player] = s;
    });

    const minStrokes = Math.min(...Object.values(strokes));
    const skinWinners = players.filter(p => strokes[p] === minStrokes);

    players.forEach(player => {
      let total = 0;
      const seo = parseInt(document.getElementById(`${player}-seo-${hole}`).value) || 0;
      const birdie = document.getElementById(`${player}-birdie-${hole}`).checked;
      const chipin = document.getElementById(`${player}-chipin-${hole}`).checked;

      total -= seo * bettingRules.seoPenalty;
      if (birdie) total += bettingRules.birdieReward;
      if (chipin) total += bettingRules.chipInReward;

      if (skinWinners.length === 1) {
        const winner = skinWinners[0];
        if (player === winner) {
          total += (players.length - 1) * bettingRules.skinAmount;
        } else {
          total -= bettingRules.skinAmount;
        }
      }

      results[player] += total;
    });
  }

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '<h2>Results</h2>';
  players.forEach(player => {
    resultsDiv.innerHTML += `<p>${player}: $${results[player]}</p>`;
  });

  localStorage.setItem('golfResults', JSON.stringify(results));
}
