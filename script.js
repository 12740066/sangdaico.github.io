let players = [];
let skinValue = 5;
let holeIndex = 0;
let holes = [];

function changeValue(field, delta) {
  const elem = document.getElementById(field);
  let value = parseInt(elem.innerText) + delta;
  value = Math.max(1, value);
  elem.innerText = value;
}

function startGame() {
  const count = parseInt(document.getElementById('playerCount').innerText);
  skinValue = parseInt(document.getElementById('skinValue').innerText);
  players = [];
  holes = [];

  for (let i = 0; i < count; i++) {
    players.push({
      name: `Player ${i + 1}`,
      handicap: 0,
      totalMoney: 0,
    });
  }

  document.getElementById('setup').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  createHoleData();
  renderHole();
}

function createHoleData() {
  const hole = players.map(p => ({
    strokes: 0,
    bonus: 0,
    penalty: 0,
  }));
  holes.push(hole);
  holeIndex = holes.length - 1;
  saveData();
}

function renderHole() {
  document.getElementById('holeNumber').innerText = holeIndex + 1;
  const table = document.getElementById('playersTable');
  table.innerHTML = `
    <tr>
      <th>Player</th>
      <th>Handicap</th>
      <th>Strokes</th>
      <th>Bonus</th>
      <th>Penalty</th>
      <th>Money</th>
    </tr>
  `;

  holes[holeIndex].forEach((data, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${players[i].name}</td>
      <td><input type="number" value="${players[i].handicap}" onchange="updateHandicap(${i}, this.value)"></td>
      <td>
        <button onclick="adjust(${i}, 'strokes', -1)">−</button>
        <span id="strokes-${i}">${data.strokes}</span>
        <button onclick="adjust(${i}, 'strokes', 1)">+</button>
      </td>
      <td>
        <button onclick="adjust(${i}, 'bonus', -1)">−</button>
        <span id="bonus-${i}">${data.bonus}</span>
        <button onclick="adjust(${i}, 'bonus', 1)">+</button>
      </td>
      <td>
        <button onclick="adjust(${i}, 'penalty', -1)">−</button>
        <span id="penalty-${i}">${data.penalty}</span>
        <button onclick="adjust(${i}, 'penalty', 1)">+</button>
      </td>
      <td id="money-${i}">$0</td>
    `;
    table.appendChild(row);
  });

  updateMoney();
}

function adjust(index, field, delta) {
  const player = holes[holeIndex][index];
  player[field] = Math.max(0, player[field] + delta);
  document.getElementById(`${field}-${index}`).innerText = player[field];
  updateMoney();
  saveData();
}

function updateHandicap(index, value) {
  players[index].handicap = parseInt(value) || 0;
  updateMoney();
  saveData();
}

function updateMoney() {
  const n = players.length;
  const moneyArray = Array(n).fill(0);
  const currentHole = holes[holeIndex];

  for (let i = 0; i < n; i++) {
    let total = 0;
    for (let j = 0; j < n; j++) {
      if (i === j) continue;

      const hcpAdj = (players[j].handicap - players[i].handicap) * 0.7;
      const adjStrokeI = currentHole[i].strokes - hcpAdj;
      const adjStrokeJ = currentHole[j].strokes;
      const strokeDiff = adjStrokeJ - adjStrokeI;

      if (strokeDiff > 0) total += 1;       // win hole
      else if (strokeDiff < 0) total -= 1;  // lose hole
      total += strokeDiff;
    }

    total += currentHole[i].bonus - currentHole[i].penalty;
    moneyArray[i] = total * skinValue;
  }

  const sum = moneyArray.reduce((a, b) => a + b, 0);
  const correction = -sum / n;
  for (let i = 0; i < n; i++) {
    const value = moneyArray[i] + correction;
    players[i].totalMoney = holes.reduce((acc, hole, hIdx) => {
      if (hIdx === holeIndex) return acc + value;
      const diff = hole[i]?.money || 0;
      return acc + diff;
    }, 0);
    currentHole[i].money = value;
    document.getElementById(`money-${i}`).innerText = `$${value.toFixed(0)}`;
  }

  const list = document.getElementById("totalMoneyList");
  list.innerHTML = "";
  players.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerText = `${p.name}: $${players[i].totalMoney.toFixed(0)}`;
    list.appendChild(li);
  });

  saveData();
}

function nextHole() {
  if (holeIndex === holes.length - 1) {
    createHoleData();
  } else {
    holeIndex++;
  }
  renderHole();
}

function prevHole() {
  if (holeIndex > 0) {
    holeIndex--;
    renderHole();
  }
}

function saveData() {
  localStorage.setItem("golfPlayers", JSON.stringify(players));
  localStorage.setItem("golfHoles", JSON.stringify(holes));
  localStorage.setItem("golfHoleIndex", holeIndex);
  localStorage.setItem("golfSkinValue", skinValue);
}

function loadData() {
  const p = localStorage.getItem("golfPlayers");
  const h = localStorage.getItem("golfHoles");
  const hi = localStorage.getItem("golfHoleIndex");
  const sv = localStorage.getItem("golfSkinValue");

  if (p && h) {
    players = JSON.parse(p);
    holes = JSON.parse(h);
    holeIndex = parseInt(hi || 0);
    skinValue = parseInt(sv || 5);
    document.getElementById("setup").style.display = "none";
    document.getElementById("game").style.display = "block";
    renderHole();
  }
}

window.onload = loadData;
