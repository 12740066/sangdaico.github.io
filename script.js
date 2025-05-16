
let playerCount = 2;
let skinValue = 5;
let players = [];

function changePlayerCount(delta) {
  playerCount = Math.max(2, playerCount + delta);
  document.getElementById('playerCount').innerText = playerCount;
}

function changeSkinValue(delta) {
  skinValue = Math.max(1, skinValue + delta);
  document.getElementById('skinValue').innerText = skinValue;
}

function startGame() {
  players = [];
  const gameArea = document.getElementById('gameArea');
  gameArea.innerHTML = '';

  for (let i = 0; i < playerCount; i++) {
    players.push({ name: 'Player ' + (i + 1), strokes: 0, bonus: 0, penalty: 0, money: 0 });
  }

  players.forEach((player, index) => {
    const div = document.createElement('div');
    div.className = 'player';
    div.innerHTML = \`
      <div class="player-name">\${player.name}</div>
      Strokes: <button onclick="adjust('${index}', 'strokes', -1)">−</button>
      <span id="strokes-\${index}">0</span>
      <button onclick="adjust('${index}', 'strokes', 1)">+</button>
      Bonus: <button onclick="adjust('${index}', 'bonus', -1)">−</button>
      <span id="bonus-\${index}">0</span>
      <button onclick="adjust('${index}', 'bonus', 1)">+</button>
      Penalty: <button onclick="adjust('${index}', 'penalty', -1)">−</button>
      <span id="penalty-\${index}">0</span>
      <button onclick="adjust('${index}', 'penalty', 1)">+</button>
      <div class="totals">Money: $<span id="money-\${index}">0</span></div>
    \`;
    gameArea.appendChild(div);
  });
  updateMoney();
}

function adjust(index, field, delta) {
  players[index][field] += delta;
  players[index][field] = Math.max(0, players[index][field]);
  document.getElementById(\`\${field}-\${index}\`).innerText = players[index][field];
  updateMoney();
}

function updateMoney() {
  players.forEach(p => p.money = 0);

  for (let i = 0; i < players.length; i++) {
    let p1 = players[i];
    for (let j = 0; j < players.length; j++) {
      if (i === j) continue;
      let p2 = players[j];
      let diff = p2.strokes - p1.strokes;

      if (diff > 0) {
        p1.money += skinValue * (1 + diff);
        p2.money -= skinValue * (1 + diff);
      } else if (diff < 0) {
        p1.money -= skinValue;
        p2.money += skinValue;
      }
    }
  }

  // Handle bonus and penalty
  players.forEach((player, i) => {
    const groupSize = players.length - 1;
    const bonusTotal = player.bonus * skinValue * groupSize;
    const penaltyTotal = player.penalty * skinValue * groupSize;
    player.money += bonusTotal;
    player.money -= penaltyTotal;
    for (let j = 0; j < players.length; j++) {
      if (i === j) continue;
      players[j].money -= player.bonus * skinValue;
      players[j].money += player.penalty * skinValue;
    }
  });

  // Update display
  players.forEach((player, index) => {
    document.getElementById(\`money-\${index}\`).innerText = player.money;
  });
}
