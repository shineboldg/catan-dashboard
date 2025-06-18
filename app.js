let players = [];
let victoryPointThreshold = 10;
let longestRoadLocked = false;
let longestRoadOwnerId = null;
let largestArmyOwnerId = null;

window.changeBuilding = function (id, type, delta) {
  const player = players.find(p => p.id === id);
  if (!player) return;

  if (type === 'roads') {
    const newRoads = player.roads + delta;
    if (newRoads < 0 || newRoads > 15) return; // Limit roads to 15
    player.roads = newRoads;
    evaluateLongestRoad(); // Check for Longest Road
  } else if (type === 'knights') {
    const newKnights = player.knights + delta;
    if (newKnights < 0) return;
    player.knights = newKnights;
    evaluateLargestArmy(); // Check for Largest Army
  } else if (type === 'cities') {
    const newCities = player.cities + delta;
    if (newCities < 0 || newCities > 4) return; // Limit cities to 4
    if (delta > 0 && player.settlements <= 0) return; // Ensure there are settlements to upgrade
    if (player[type] + delta >= 0) {
      player[type] += delta;
      if (delta > 0) player.settlements -= delta; // Decrease settlements when adding cities
      if (delta < 0) player.settlements -= delta; // Restore settlements when removing cities
    }
  } else if (type === 'settlements') {
    const newSettlements = player.settlements + delta;
    if (newSettlements < 0 || newSettlements > 5) return; // Limit settlements to 5
    if (player[type] + delta >= 0) {
      player[type] += delta;
    }
  } else if (type === 'victoryPoints') {
    if (player[type] + delta >= 0) {
      player[type] += delta;
    }
  }

  // Remove Longest Road if conditions are not met
  if (player.roads < 5 && player.id === longestRoadOwnerId && !longestRoadLocked) {
    player.longestRoad = false;
    longestRoadOwnerId = null;
  }

  // Remove Largest Army if conditions are not met
  if (player.knights < 3 && player.id === largestArmyOwnerId) {
    player.largestArmy = false;
    largestArmyOwnerId = null;
  }

  evaluateLongestRoad();
  evaluateLargestArmy();
  checkWinner();
  renderPlayers();
};

function evaluateLongestRoad() {
  if (longestRoadLocked) return;

  let topPlayer = null;
  let maxRoads = 4;

  players.forEach(p => {
    if (p.roads >= maxRoads) {
      if (p.roads > maxRoads || (p.roads === maxRoads && longestRoadOwnerId === p.id)) {
        maxRoads = p.roads;
        topPlayer = p;
      }
    }
  });

  if (!topPlayer) return;

  players.forEach(p => p.longestRoad = false);
  topPlayer.longestRoad = true;
  longestRoadOwnerId = topPlayer.id;

  if (topPlayer.roads === 15) {
    longestRoadLocked = true;
    topPlayer.hasLockedLongestRoad = true;
  }
}

function evaluateLargestArmy() {
  let topPlayer = null;
  let maxKnights = 2;

  players.forEach(p => {
    if (p.knights >= maxKnights) {
      if (p.knights > maxKnights || (p.knights === maxKnights && largestArmyOwnerId === p.id)) {
        maxKnights = p.knights;
        topPlayer = p;
      }
    }
  });

  if (!topPlayer) return;

  players.forEach(p => p.largestArmy = false);
  topPlayer.largestArmy = true;
  largestArmyOwnerId = topPlayer.id;
}

function checkWinner() {
  players.forEach(player => {
    const total = getTotalScore(player);
    if (total >= victoryPointThreshold) {
      alert(`${player.name} has won the game with ${total} points!`);
    }
  });
}
window.setupPlayers = function () {
  const count = parseInt(document.getElementById("playerCount").value);
  const nameForm = document.getElementById("nameForm");
  const victoryInput = document.getElementById("victoryPoints");
  victoryPointThreshold = parseInt(victoryInput.value);

  if (isNaN(victoryPointThreshold) || victoryPointThreshold <= 0) {
    alert("Victory point threshold must be a positive number.");
    return;
  }

  nameForm.innerHTML = "";

  for (let i = 0; i < count; i++) {
    nameForm.innerHTML += `
      <input type="text" placeholder="Player ${i + 1} нэр" id="name-${i}"
             class="w-full border border-gray-300 p-2 rounded" />
    `;
  }

  nameForm.innerHTML += `
    <button type="submit"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-2">
      Тоглоом эхлүүлэх
    </button>`;

  nameForm.onsubmit = (e) => {
    e.preventDefault();

    const playerNames = [];
    for (let i = 0; i < count; i++) {
      const name = document.getElementById(`name-${i}`).value.trim();
      if (!name) {
        alert(`Player ${i + 1} name cannot be empty.`);
        return;
      }
      if (playerNames.includes(name)) {
        alert("Player names must be unique.");
        return;
      }
      playerNames.push(name);
    }

    document.querySelector(".form-section").classList.add("hidden");
    document.getElementById("resetSection").classList.remove("hidden");

    players = [];
    longestRoadLocked = false;
    longestRoadOwnerId = null;
    largestArmyOwnerId = null;

    playerNames.forEach((name, i) => {
      players.push({
        id: i + 1,
        name,
        settlements: 0,
        cities: 0,
        roads: 0,
        knights: 0,
        victoryPoints: 0, // New property
        longestRoad: false,
        largestArmy: false,
        hasLockedLongestRoad: false
      });
    });

    renderPlayers();
  };
};

window.resetGame = function () {
  if (!confirm("Are you sure you want to reset the game?")) return;

  document.querySelector(".form-section").classList.remove("hidden");
  document.getElementById("resetSection").classList.add("hidden");
  document.getElementById("players").innerHTML = "";
  document.getElementById("nameForm").innerHTML = "";
  players = [];
};

function getTotalScore(player) {
  let total = player.settlements + player.cities * 2 + player.victoryPoints; // Include victoryPoints
  if (player.longestRoad) total += 2;
  if (player.largestArmy) total += 2;
  return total;
}

function renderPlayers() {
  const playersDiv = document.getElementById("players");
  playersDiv.innerHTML = "";
  playersDiv.className = "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto";

  players.forEach(player => {
    const totalScore = getTotalScore(player);
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="bg-white text-gray-800 rounded-xl shadow p-6 space-y-3">
        <h2 class="text-xl font-bold">${player.name}</h2>
        <div class="text-lg">Нийт оноо: <strong class="text-blue-600">${totalScore}</strong></div>

        <div class="space-y-1">
          ${renderStatRow(player.id, "Жижиг байшин", "settlements", player.settlements)}
          ${renderStatRow(player.id, "Том байшин", "cities", player.cities)}
          ${renderStatRow(player.id, "Зам", "roads", player.roads)}
          ${renderStatRow(player.id, "Knight", "knights", player.knights)}
          ${renderStatRow(player.id, "Victory Points", "victoryPoints", player.victoryPoints)}
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          ${player.longestRoad 
            ? `<span class="inline-block bg-yellow-400 text-black text-sm font-semibold px-3 py-1 rounded-full">🏆 Longest Road</span>` 
            : ""}
          ${player.largestArmy 
            ? `<span class="inline-block bg-green-400 text-black text-sm font-semibold px-3 py-1 rounded-full">🛡️ Largest Army</span>` 
            : ""}
        </div>
      </div>
    `;
    playersDiv.appendChild(div);
  });
}


function renderStatRow(id, label, type, value) {
  return `
    <div class="flex items-center justify-between gap-2">
      <div>
        <strong>${label}:</strong> ${value}
      </div>
      <div class="flex gap-1">
        <button onclick="changeBuilding(${id}, '${type}', 1)"
                class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">+1</button>
        <button onclick="changeBuilding(${id}, '${type}', -1)"
                class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">-1</button>
      </div>
    </div>
  `;
}

function evaluateLongestRoad() {
  if (longestRoadLocked) return;

  let topPlayer = null;
  let maxRoads = 4;

  players.forEach(p => {
    if (p.roads >= maxRoads) {
      if (p.roads > maxRoads || (p.roads === maxRoads && longestRoadOwnerId === p.id)) {
        maxRoads = p.roads;
        topPlayer = p;
      }
    }
  });

  if (!topPlayer) return;

  players.forEach(p => p.longestRoad = false);
  topPlayer.longestRoad = true;
  longestRoadOwnerId = topPlayer.id;

  if (topPlayer.roads === 15) {
    longestRoadLocked = true;
    topPlayer.hasLockedLongestRoad = true;
  }
}

function evaluateLargestArmy() {
  let topPlayer = null;
  let maxKnights = 2;

  players.forEach(p => {
    if (p.knights >= maxKnights) {
      if (p.knights > maxKnights || (p.knights === maxKnights && largestArmyOwnerId === p.id)) {
        maxKnights = p.knights;
        topPlayer = p;
      }
    }
  });

  if (!topPlayer) return;

  players.forEach(p => p.largestArmy = false);
  topPlayer.largestArmy = true;
  largestArmyOwnerId = topPlayer.id;
}

function checkWinner() {
  players.forEach(player => {
    const total = getTotalScore(player);
    if (total >= victoryPointThreshold) {
      alert(`${player.name} has won the game with ${total} points!`);
    }
  });
}
