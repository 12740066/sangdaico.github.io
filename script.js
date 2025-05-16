<script>
  let players = [];
  let handicaps = {};
  let scores = {};
  let bonusData = {};
  let penaltyData = {};
  let currentHole = 1;
  let skinValue = 5;

  // Save everything to localStorage
  function saveGame(){
    const data = {
      players,
      handicaps,
      scores,
      bonusData,
      penaltyData,
      currentHole,
      skinValue
    };
    localStorage.setItem('golfBetGame', JSON.stringify(data));
  }

  // Load game data if exists
  function loadGame(){
    const dataStr = localStorage.getItem('golfBetGame');
    if(dataStr){
      try {
        const data = JSON.parse(dataStr);
        players = data.players || [];
        handicaps = data.handicaps || {};
        scores = data.scores || {};
        bonusData = data.bonusData || {};
        penaltyData = data.penaltyData || {};
        currentHole = data.currentHole || 1;
        skinValue = data.skinValue || 5;
        return true;
      } catch {
        console.log('Failed to load saved game data.');
        return false;
      }
    }
    return false;
  }

  // Clear saved data (optional, for new game)
  function clearSave(){
    localStorage.removeItem('golfBetGame');
  }

  function adjustValue(id, delta) {
    const input = document.getElementById(id);
    let val = parseInt(input.value || '0');
    val += delta;
    if (id === 'playerCount') {
      val = Math.max(2, Math.min(6, val));
    } else if (id === 'skinValue') {
      val = Math.max(1, val);
    }
    input.value = val;
  }

  // When Next clicked: show player name and handicap inputs
  document.getElementById('nextBtn').addEventListener('click', () => {
    const count = parseInt(document.getElementById('playerCount').value);
    const container = document.getElementById('playerInputs');
    container.innerHTML = '';
    for(let i=0; i < count; i++) {
      container.innerHTML += `
        <div>
          <label>Player ${i+1} Name: <input id="pname${i}" /></label>
          <label style="margin-left:10px;">Handicap: <input id="phcap${i}" type="number" min="0" /></label>
        </div>
      `;
    }
    document.getElementById('startBtn').style.display = 'inline-block';
  });

  // When Start Game clicked: initialize all arrays and show game section
  document.getElementById('startBtn').addEventListener('click', () => {
    skinValue = parseFloat(document.getElementById('skinValue').value) || 5;
    const count = parseInt(document.getElementById('playerCount').value);

    players = [];
    handicaps = {};
    scores = {};
    bonusData = {};
    penaltyData = {};

    for(let i=0; i < count; i++){
      const name = document.getElementById(`pname${i}`).value.trim() || `Player ${i+1}`;
      const hcap = parseInt(document.getElementById(`phcap${i}`).value) || 0;
      players.push(name);
      handicaps[name] = hcap;
      scores[name] = Array(18).fill(0);
      bonusData[name] = Array(18).fill(0);
      penaltyData[name] = Array(18).fill(0);
    }

    currentHole = 1;

    document.querySelector('.setup').style.display = 'none';
    document.getElementById('game').style.display = 'block';

    renderHole();
    saveGame();
  });

  function renderHole(){
    document.getElementById('holeNum').textContent = currentHole;

    const container = document.getElementById('scoreInputs');
    container.innerHTML = '';

    players.forEach(name => {
      const stroke = scores[name][currentHole - 1];
      const bonus = bonusData[name][currentHole - 1];
      const penalty = penaltyData[name][currentHole - 1];

      container.innerHTML += `
        <div>
          <strong>${name}</strong><br/>
          Strokes 
          <button onclick="changeScore('${name}', -1)">−</button>
          <span>${stroke}</span>
          <button onclick="changeScore('${name}', 1)">+</button>
          &nbsp;&nbsp;
          Bonus 
          <button onclick="changeBonus('${name}', -1)">−</button>
          <span>${bonus}</span>
          <button onclick="changeBonus('${name}', 1)">+</button>
          &nbsp;&nbsp;
          Penalty 
          <button onclick="changePenalty('${name}', -1)">−</button>
          <span>${penalty}</span>
          <button onclick="changePenalty('${name}', 1)">+</button>
          &nbsp;&nbsp;
          <strong>Total $: ${calculateTotal(name)}</strong>
        </div>
      `;
    });

    renderEarnings();
  }

  function calculateTotal(player){
    let winner = null;
    let winnerStroke = Infinity;

    players.forEach(p => {
      const st = scores[p][currentHole-1];
      if(st > 0 && st < winnerStroke){
        winnerStroke = st;
        winner = p;
      }
    });

    if(!winner) return 0;

    const comp = (handicaps[winner] - handicaps[player]) * 0.7;
    const diff = scores[player][currentHole-1] - winnerStroke + comp;

    let money = 0;
    if(diff > 0) {
      money = -skinValue * (diff + 1);
    } else if(player === winner) {
      let totalWin = skinValue;
      players.forEach(p => {
        if(p !== winner){
          const d = scores[p][currentHole-1] - winnerStroke + ((handicaps[winner] - handicaps[p]) * 0.7);
          if(d > 0){
            totalWin += skinValue * d;
          }
        }
      });
      money = totalWin;
    } else {
      money = 0;
    }

    money += (bonusData[player][currentHole-1] * skinValue);
    money -= (penaltyData[player][currentHole-1] * skinValue);

    return money.toFixed(2);
  }

  function renderEarnings(){
    const list = document.getElementById('earningsList');
    list.innerHTML = '';
    players.forEach(p => {
      let total = 0;
      for(let h=0; h<18; h++){
        total += parseFloat(calculateTotalForHole(p, h+1));
      }
      list.innerHTML += `<li><strong>${p}:</strong> $${total.toFixed(2)}</li>`;
    });
  }

  function calculateTotalForHole(player, hole){
    let winner = null;
    let winnerStroke = Infinity;

    players.forEach(p => {
      const st = scores[p][hole-1];
      if(st > 0 && st < winnerStroke){
        winnerStroke = st;
        winner = p;
      }
    });

    if(!winner) return 0;

    const comp = (handicaps[winner] - handicaps[player]) * 0.7;
    const diff = scores[player][hole-1] - winnerStroke + comp;

    let money = 0;
    if(diff > 0) {
      money = -skinValue * (diff + 1);
    } else if(player === winner) {
      let totalWin = skinValue;
      players.forEach(p => {
        if(p !== winner){
          const d = scores[p][hole-1] - winnerStroke + ((handicaps[winner] - handicaps[p]) * 0.7);
          if(d > 0){
            totalWin += skinValue * d;
          }
        }
      });
      money = totalWin;
    } else {
      money = 0;
    }

    money += (bonusData[player][hole-1] * skinValue);
    money -= (penaltyData[player][hole-1] * skinValue);

    return money;
  }

  function changeScore(player, delta){
    let val = scores[player][currentHole-1];
    val = val + delta;
    if(val < 1) val = 1;
    scores[player][currentHole-1] = val;
    renderHole();
    saveGame();
  }

  function changeBonus(player, delta){
    let val = bonusData[player][currentHole-1];
    val = val + delta;
    if(val < 0) val = 0;
    bonusData[player][currentHole-1] = val;
    renderHole();
    saveGame();
  }

  function changePenalty(player, delta){
    let val = penaltyData[player][currentHole-1];
    val = val + delta;
    if(val < 0) val = 0;
    penaltyData[player][currentHole-1] = val;
    renderHole();
    saveGame();
  }

  function nextHole(){
    if(currentHole < 18){
      currentHole++;
      renderHole();
      saveGame();
    }
  }

  function prevHole(){
    if(currentHole > 1){
      currentHole--;
      renderHole();
      saveGame();
    }
  }

  // On page load, try to load saved game
  window.onload = function() {
    if(loadGame()){
      // Show game view directly if saved game found
      document.querySelector('.setup').style.display = 'none';
      document.getElementById('game').style.display = 'block';
      renderHole();
    }
  }
</script>
