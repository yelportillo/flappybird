// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas and scale elements
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    playButton.x = canvas.width / 2 - canvas.width * 0.15;
    playButton.y = canvas.height / 2 - canvas.height * 0.08;
    restartButton.x = canvas.width / 2 - canvas.width * 0.15;
    restartButton.y = canvas.height / 1.5 - canvas.height * 0.05;

    buttonConfig.width = canvas.width * 0.3;
    buttonConfig.height = canvas.height * 0.1;
    buttonConfig.radius = Math.min(canvas.width, canvas.height) * 0.025;
    buttonConfig.fontSize = Math.floor(canvas.width / 25);

    pipeGap = canvas.height * 0.32;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Load images
const birdImg = new Image();
birdImg.src = "assets/bird.png";

const pipeImg = new Image();
pipeImg.src = "assets/pipe.png";

const backgroundImg = new Image();
backgroundImg.src = "assets/background.png";

// Bird
let bird = { x: canvas.width / 5, y: canvas.height / 2 - 20, width: 0, height: 0, velocity: 0, rotation: 0 };
const gravity = 0.38;
const jump = -8;

// Game variables
let score = 0;
const pipes = [];
let pipeWidth = canvas.width * 0.07;
let frameCount = 0;

// Flap cooldown
let lastFlapTime = 0;
const flapCooldown = 300;

// Game states
let gameState = "menu";

// Buttons
const playButton = { x: 0, y: 0 };
const restartButton = { x: 0, y: 0 };

// Button style
const buttonConfig = { width: 0, height: 0, radius: 0, color: "#FF6347", font: "white", fontSize: 0, shadowBlur: 10 };

// Input handling for desktop and mobile
document.addEventListener("keydown", flap);
document.addEventListener("click", flap);
document.addEventListener("touchstart", flap);

function flap(e) {
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
    bird.y = canvas.height / 2 - canvas.height * 0.03;
    bird.velocity = 0;
    bird.rotation = 0;
    pipes.length = 0;
    score = 0;
    frameCount = 0;
    pipeWidth = canvas.width * 0.07;
}

function addPipe() {
    const topHeight = Math.random() * (canvas.height - pipeGap - 50) + 50;
    pipes.push({ x: canvas.width, y: 0, width: pipeWidth, height: topHeight, passed: false });
    pipes.push({ x: canvas.width, y: topHeight + pipeGap, width: pipeWidth, height: canvas.height - (topHeight + pipeGap), passed: false });
}

function resetGame() {
    gameState = "gameOver";
}

function drawBird() {
    bird.width = canvas.height * 0.06;
    bird.height = canvas.height * 0.05;

    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    ctx.drawImage(birdImg, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    ctx.restore();
}

function drawButton(x, y, text) {
    ctx.fillStyle = buttonConfig.color;
    ctx.shadowColor = "black";
    ctx.shadowBlur = buttonConfig.shadowBlur;
    ctx.beginPath();
    ctx.moveTo(x + buttonConfig.radius, y);
    ctx.lineTo(x + buttonConfig.width - buttonConfig.radius, y);
    ctx.quadraticCurveTo(x + buttonConfig.width, y, x + buttonConfig.width, y + buttonConfig.radius);
    ctx.lineTo(x + buttonConfig.width, y + buttonConfig.height - buttonConfig.radius);
    ctx.quadraticCurveTo(x + buttonConfig.width, y + buttonConfig.height, x + buttonConfig.width - buttonConfig.radius, y + buttonConfig.height);
    ctx.lineTo(x + buttonConfig.radius, y + buttonConfig.height);
    ctx.quadraticCurveTo(x, y + buttonConfig.height, x, y + buttonConfig.height - buttonConfig.radius);
    ctx.lineTo(x, y + buttonConfig.radius);
    ctx.quadraticCurveTo(x, y, x + buttonConfig.radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = buttonConfig.font;
    ctx.font = `${buttonConfig.fontSize}px Comic Sans MS`;
    ctx.textAlign = "center";
    ctx.fillText(text, x + buttonConfig.width / 2, y + buttonConfig.height / 1.8);
}

function drawMenu() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFD700";
    ctx.font = `${Math.floor(canvas.width / 10)}px Comic Sans MS`;
    ctx.textAlign = "center";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 15;
    ctx.fillText("FLAPPY BIRD", canvas.width / 2, canvas.height / 4);
    ctx.shadowBlur = 0;
    drawButton(playButton.x, playButton.y, "PLAY");
}

function drawGameOver() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FF4500";
    ctx.font = `${Math.floor(canvas.width / 15)}px Comic Sans MS`;
    ctx.textAlign = "center";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 10;
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 3);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.font = `${Math.floor(canvas.width / 25)}px Comic Sans MS`;
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
    drawButton(restartButton.x, restartButton.y, "RESTART");
}

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
        const pipeHeight = pipe.height;
        if (pipe.y === 0) {
            ctx.save();
            ctx.translate(pipe.x + pipe.width / 2, pipeHeight / 2);
            ctx.scale(1, -1);
            ctx.drawImage(pipeImg, -pipe.width / 2, -pipeHeight / 2, pipe.width, pipeHeight);
            ctx.restore();
        } else {
            ctx.drawImage(pipeImg, pipe.x, pipe.y, pipe.width, pipeHeight);
        }
    });

    pipes.forEach(pipe => {
        if (bird.x < pipe.x + pipe.width && bird.x + bird.width > pipe.x &&
            bird.y < pipe.y + pipe.height && bird.y + bird.height > pipe.y) resetGame();
        if (!pipe.passed && pipe.y !== 0 && pipe.x + pipe.width < bird.x) {
            pipe.passed = true;
            score++;
        }
    });

    for (let i = pipes.length - 1; i >= 0; i--) if (pipes[i].x + pipes[i].width < 0) pipes.splice(i, 1);

    const bottomBuffer = 5;
    if (bird.y < 0 || bird.y + bird.height > canvas.height - bottomBuffer) resetGame();

    ctx.fillStyle = "white";
    ctx.font = `${Math.floor(canvas.width / 20)}px Comic Sans MS`;
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, 20, 50);
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameState === "menu") drawMenu();
    else if (gameState === "playing") gameLoop();
    else if (gameState === "gameOver") drawGameOver();
    requestAnimationFrame(update);
}

update();
