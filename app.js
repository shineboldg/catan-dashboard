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