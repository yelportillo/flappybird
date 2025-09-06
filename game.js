// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Bird, pipes, buttons, and game state
let bird = { x: 0, y: 0, width: 0, height: 0, velocity: 0, rotation: 0 };
let pipes = [];
let score = 0;
let frameCount = 0;
let gameState = "menu";

// Settings
const gravity = 0.38;
const jump = -8;
let pipeGap = 0;
let pipeWidth = 0;
const flapCooldown = 300;
let lastFlapTime = 0;

// Buttons
const playButton = { x: 0, y: 0 };
const restartButton = { x: 0, y: 0 };
const buttonConfig = { width: 0, height: 0, radius: 0, color: "#FF6347", font: "white", fontSize: 0, shadowBlur: 10 };

// Images
const birdImg = new Image();
birdImg.src = "assets/bird.png";
const pipeImg = new Image();
pipeImg.src = "assets/pipe.png";
const backgroundImg = new Image();
backgroundImg.src = "assets/background.png";

// Preload images
let imagesLoaded = 0;
[birdImg, pipeImg, backgroundImg].forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === 3) startGameLoop();
    };
});

// Resize canvas and scale elements
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    pipeGap = canvas.height * 0.32;
    pipeWidth = canvas.width * 0.07;

    playButton.x = canvas.width / 2 - canvas.width * 0.15;
    playButton.y = canvas.height / 2 - canvas.height * 0.08;
    restartButton.x = canvas.width / 2 - canvas.width * 0.15;
    restartButton.y = canvas.height / 1.5 - canvas.height * 0.05;

    buttonConfig.width = canvas.width * 0.3;
    buttonConfig.height = canvas.height * 0.1;
    buttonConfig.radius = Math.min(canvas.width, canvas.height) * 0.025;
    buttonConfig.fontSize = Math.floor(canvas.width / 25);

    bird.x = canvas.width / 5;
    bird.width = canvas.height * 0.06;
    bird.height = canvas.height * 0.05;
    bird.y = canvas.height / 2 - bird.height / 2;
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", () => setTimeout(resizeCanvas, 200)); // mobile fix

// Input handling
document.addEventListener("keydown", flap);
document.addEventListener("click", flap);
document.addEventListener("touchstart", flap);

function flap() {
    if (gameState === "menu") startGame();
    else if (gameState === "playing") {
        const now = Date.now();
        if (now - lastFlapTime > flapCooldown) {
            bird.velocity = jump;
            bird.rotation = -0.5;
            lastFlapTime = now;
        }
    } else if (gameState === "gameOver") startGame();
}

function startGame() {
    gameState = "playing";
    bird.y = canvas.height / 2 - bird.height / 2;
    bird.velocity = 0;
    bird.rotation = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    resizeCanvas();
}

// Add new pipe pair
function addPipe() {
    const topHeight = Math.random() * (canvas.height - pipeGap - 50) + 50;
    pipes.push({ x: canvas.width, y: 0, width: pipeWidth, height: topHeight, passed: false });
    pipes.push({ x: canvas.width, y: topHeight + pipeGap, width: pipeWidth, height: canvas.height - (topHeight + pipeGap), passed: false });
}

// Reset game
function resetGame() { gameState = "gameOver"; }

// Draw bird
function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    ctx.drawImage(birdImg, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    ctx.restore();
}

// Draw button with centered text
function drawButton(x, y, text) {
    const width = buttonConfig.width;
    const height = buttonConfig.height;
    const radius = buttonConfig.radius;

    ctx.fillStyle = buttonConfig.color;
    ctx.shadowColor = "black";
    ctx.shadowBlur = buttonConfig.shadowBlur;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = buttonConfig.font;
    ctx.font = `${buttonConfig.fontSize}px Comic Sans MS`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"; // perfectly centered
    ctx.fillText(text, x + width / 2, y + height / 2);
}

// Draw menu
function drawMenu() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFD700";
    ctx.font = `${Math.floor(canvas.width / 10)}px Comic Sans MS`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 15;
    ctx.fillText("FLAPPY BIRD", canvas.width / 2, canvas.height / 6);
    ctx.shadowBlur = 0;
    drawButton(playButton.x, playButton.y, "PLAY");
}

// Draw game over
function drawGameOver() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FF4500";
    ctx.font = `${Math.floor(canvas.width / 15)}px Comic Sans MS`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 10;
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 6);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.font = `${Math.floor(canvas.width / 25)}px Comic Sans MS`;
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 3);
    drawButton(restartButton.x, restartButton.y, "RESTART");
}

// Game loop
function gameLoop() {
    frameCount++;
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    bird.velocity += gravity;
    bird.y += bird.velocity;
    bird.rotation += 0.03;
    if (bird.rotation > 1) bird.rotation = 1;
    drawBird();

    if (frameCount % 130 === 0) addPipe();

    pipes.forEach(pipe => pipe.x -= 2.3);
    pipes.forEach(pipe => {
        if (pipe.y === 0) {
            ctx.save();
            ctx.translate(pipe.x + pipe.width / 2, pipe.height / 2);
            ctx.scale(1, -1);
            ctx.drawImage(pipeImg, -pipe.width / 2, -pipe.height / 2, pipe.width, pipe.height);
            ctx.restore();
        } else {
            ctx.drawImage(pipeImg, pipe.x, pipe.y, pipe.width, pipe.height);
        }
    });

    pipes.forEach(pipe => {
        if (bird.x < pipe.x + pipe.width && bird.x + bird.width > pipe.x &&
            bird.y < pipe.y + pipe.height && bird.y + bird.height > pipe.y) resetGame();
        if (!pipe.passed && pipe.y !== 0 && pipe.x + pipe.width < bird.x) { pipe.passed = true; score++; }
    });

    for (let i = pipes.length - 1; i >= 0; i--) if (pipes[i].x + pipes[i].width < 0) pipes.splice(i, 1);

    const bottomBuffer = 5;
    if (bird.y < 0 || bird.y + bird.height > canvas.height - bottomBuffer) resetGame();

    ctx.fillStyle = "white";
    ctx.font = `${Math.floor(canvas.width / 20)}px Comic Sans MS`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`Score: ${score}`, 20, 20);
}

// Update loop
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameState === "menu") drawMenu();
    else if (gameState === "playing") gameLoop();
    else if (gameState === "gameOver") drawGameOver();
    requestAnimationFrame(update);
}

// Start game after images loaded
function startGameLoop() {
    resizeCanvas();
    update();
}
