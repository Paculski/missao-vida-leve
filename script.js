const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Screen elements
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

// Info display
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('finalScore');
const playerSizeDisplay = document.getElementById('playerSize');

// Game variables
const gridSize = 20;
let player, food, obstacle, score, playerSize, direction, gameInterval, isGameOver;

const playerBaseSize = 10;
const playerMaxSize = 20; // Game over if size reaches this
const playerMinSize = 5;  // Minimum size

// Player object
const playerSprite = {
    x: 0,
    y: 0,
    size: playerBaseSize
};

// --- Game Initialization ---
function init() {
    score = 0;
    playerSize = playerBaseSize;
    isGameOver = false;
    direction = { x: 0, y: 0 };

    playerSprite.x = Math.floor(canvas.width / 2 / gridSize) * gridSize;
    playerSprite.y = Math.floor(canvas.height / 2 / gridSize) * gridSize;
    playerSprite.size = playerBaseSize;

    scoreDisplay.textContent = score;
    playerSizeDisplay.textContent = playerSize;

    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');

    // Clear canvas for new game
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// --- Game Loop ---
function gameLoop() {
    if (isGameOver) return;

    update();
    draw();
}

function startGame() {
    startScreen.classList.add('hidden');
    generateFood();
    generateObstacle();
    gameInterval = setInterval(gameLoop, 150); // Adjust for speed
}

// --- Update game state ---
function update() {
    // Move player
    playerSprite.x += direction.x * gridSize;
    playerSprite.y += direction.y * gridSize;

    // Check for collisions
    checkWallCollision();
    checkFoodCollision();
    checkObstacleCollision();
}

// --- Drawing on canvas ---
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = '#4682b4'; // SteelBlue
    ctx.beginPath();
    ctx.arc(playerSprite.x + playerSprite.size, playerSprite.y + playerSprite.size, playerSprite.size, 0, 2 * Math.PI);
    ctx.fill();

    // Draw food
    ctx.font = '20px Arial';
    ctx.fillText('🥦', food.x, food.y + gridSize);

    // Draw obstacle
    ctx.fillText('🍔', obstacle.x, obstacle.y + gridSize);
}

// --- Collision Detection ---
function checkWallCollision() {
    if (playerSprite.x < 0 || playerSprite.x >= canvas.width || playerSprite.y < 0 || playerSprite.y >= canvas.height) {
        endGame();
    }
}

function checkFoodCollision() {
    if (playerSprite.x === food.x && playerSprite.y === food.y) {
        score += 10;
        playerSize = Math.max(playerMinSize, playerSize - 1);
        playerSprite.size = playerSize;
        scoreDisplay.textContent = score;
        playerSizeDisplay.textContent = playerSize;
        generateFood();
    }
}

function checkObstacleCollision() {
    if (playerSprite.x === obstacle.x && playerSprite.y === obstacle.y) {
        score -= 5;
        playerSize += 2;
        playerSprite.size = playerSize;
        scoreDisplay.textContent = score;
        playerSizeDisplay.textContent = playerSize;
        if (playerSize >= playerMaxSize) {
            endGame();
        } else {
            generateObstacle();
        }
    }
}

// --- Item Generation ---
function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
}

function generateObstacle() {
    obstacle = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
    // Ensure obstacle doesn't spawn on food
    if (obstacle.x === food.x && obstacle.y === food.y) {
        generateObstacle();
    }
}

// --- Game Over ---
function endGame() {
    isGameOver = true;
    clearInterval(gameInterval);
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// --- Event Listeners ---
window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = { x: 1, y: 0 };
            break;
    }
});

// --- Touch Controls for Mobile ---
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

canvas.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    e.preventDefault(); // Prevent page scrolling
}, { passive: false });

canvas.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
    e.preventDefault(); // Prevent page scrolling
}, { passive: false });

function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const swipeThreshold = 30; // Minimum distance for a swipe to be registered

    // Prioritize horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > swipeThreshold) {
            if (deltaX > 0) {
                if (direction.x === 0) direction = { x: 1, y: 0 }; // Right
            } else {
                if (direction.x === 0) direction = { x: -1, y: 0 }; // Left
            }
        }
    }
    // Otherwise, check for vertical swipe
    else {
        if (Math.abs(deltaY) > swipeThreshold) {
            if (deltaY > 0) {
                if (direction.y === 0) direction = { x: 0, y: 1 }; // Down
            } else {
                if (direction.y === 0) direction = { x: 0, y: -1 }; // Up
            }
        }
    }
}


startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => {
    init();
    startGame();
});

// --- Initial call ---
init();
