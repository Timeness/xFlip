// Initialize points and state from local storage
let points = parseFloat(localStorage.getItem("xFlipPoints")) || 0.00010;
const increment = 0.00002;
const display = document.getElementById("points");
let lastClaimTime = localStorage.getItem("lastClaimTime") || 0;
const lastClaimDisplay = document.getElementById("lastClaim");
const miningStatus = document.getElementById("miningStatus");
const claimBtn = document.getElementById("claimBtn");
const leaderboardList = document.getElementById("leaderboardList");
const spinBtn = document.getElementById("spinBtn");
const spinResult = document.getElementById("spinResult");
const transactionIdDisplay = document.getElementById("transactionId");
let userIp = "unknown";

// Get user IP using ip-api
async function getUserIp() {
    const response = await fetch("http://ip-api.com/json");
    const data = await response.json();
    userIp = data.query; // User IP
    localStorage.setItem("userIp", userIp);
    updateLeaderboard();
}

// Mask IP for display in leaderboard
function maskIp(ip) {
    const parts = ip.split(".");
    return `${parts[0]}.${parts[1]}...${parts[3]}`;
}

// Update leaderboard data
function updateLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem("xFlipLeaderboard")) || [];
    let user = { name: `{ip ${maskIp(userIp)}}`, points: points.toFixed(5), id: userIp };

    let existingIndex = leaderboard.findIndex(player => player.id === userIp);
    if (existingIndex !== -1) {
        leaderboard[existingIndex] = user;
    } else {
        leaderboard.push(user);
    }

    leaderboard.sort((a, b) => parseFloat(b.points) - parseFloat(a.points));
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem("xFlipLeaderboard", JSON.stringify(leaderboard));

    leaderboardList.innerHTML = leaderboard.map(player =>
        `<li>${player.name} - ${player.points}</li>`
    ).join("");
}

// Update points every 2 seconds to simulate mining
function updatePoints() {
    points += increment;
    localStorage.setItem("xFlipPoints", points.toFixed(5));
    display.textContent = points.toFixed(5);

    // Update mining status
    const now = Date.now();
    const diff = Math.floor((now - lastClaimTime) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    if (hours >= 1) {
        miningStatus.textContent = `Mining stopped. Please claim every hour. Last claim: ${hours}h ${minutes}m ago`;
    } else {
        miningStatus.textContent = `Mining... Claim after 1 hour. Last claim: ${hours}h ${minutes}m ${seconds}s ago`;
    }
}

// Claim button functionality
claimBtn.addEventListener("click", () => {
    const now = Date.now();
    lastClaimTime = now;
    localStorage.setItem("lastClaimTime", now);
    alert("You have claimed your xFlip points!");
    miningStatus.textContent = "Mining running... Please claim after 1 hour.";
    updateLeaderboard();
});

// Spin the wheel functionality
spinBtn.addEventListener("click", () => {
    const fee = 0.01; // Spin fee
    points -= fee;
    localStorage.setItem("xFlipPoints", points.toFixed(5));

    // Simulate spinning result
    const prize = Math.random() > 0.8 ? "Jackpot" : Math.random() > 0.5 ? "Medium Jackpot" : "Small Prize";
    const transactionId = Math.random().toString(36).substring(7);

    spinResult.textContent = `You won: ${prize}`;
    transactionIdDisplay.textContent = `Transaction ID: ${transactionId}`;

    // Update leaderboard after the spin
    updateLeaderboard();
});

// Initialize application
function initialize() {
    display.textContent = points.toFixed(5);
    getUserIp();  // Get user IP and initialize leaderboard
    setInterval(updatePoints, 2000);  // Simulate mining every 2 seconds
}

initialize();
