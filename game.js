// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Function to resize canvas and scale elements
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Recalculate button positions
    playButton.x = canvas.width/2 - 120;
    playButton.y = canvas.height/2 - 50;
    restartButton.x = canvas.width/2 - 120;
    restartButton.y = canvas.height/1.5 - 40;

    // Adjust font sizes
    buttonConfig.fontSize = Math.floor(canvas.width/25);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // initial call

// Load images
const birdImg = new Image();
birdImg.src = "assets/bird.png";

const pipeImg = new Image();
pipeImg.src = "assets/pipe.png";

const backgroundImg = new Image();
backgroundImg.src = "assets/background.png";

// Bird
let bird = { x: canvas.width/5, y: canvas.height/2-20, width:50, height:40, velocity:0, rotation:0 };
const gravity = 0.38;
const jump = -8;

// Game variables
let score = 0;
const pipes = [];
let pipeGap = canvas.height * 0.32;
const pipeWidth = 80;
let frameCount = 0;

// Flap cooldown
let lastFlapTime = 0;
const flapCooldown = 300;

// Game states
let gameState = "menu";

// Buttons
const playButton = { x: canvas.width/2-120, y: canvas.height/2-50 };
const restartButton = { x: canvas.width/2-120, y: canvas.height/1.5-40 };

// Button style
const buttonConfig = { width:240, height:80, radius:20, color:"#FF6347", font:"white", fontSize:Math.floor(canvas.width/25), shadowBlur:10 };

// Input handling
document.addEventListener("keydown", handleInput);
document.addEventListener("click", handleInput);

function handleInput(e) {
    if(gameState==="menu") {
        if(e.type==="click"){
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            if(clickX>=playButton.x && clickX<=playButton.x+buttonConfig.width &&
               clickY>=playButton.y && clickY<=playButton.y+buttonConfig.height) startGame();
        } else startGame();
    } else if(gameState==="playing") {
        const now = Date.now();
        if(now - lastFlapTime > flapCooldown){
            bird.velocity = jump;
            bird.rotation = -0.5;
            lastFlapTime = now;
        }
    } else if(gameState==="gameOver") {
        if(e.type==="click"){
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            if(clickX>=restartButton.x && clickX<=restartButton.x+buttonConfig.width &&
               clickY>=restartButton.y && clickY<=restartButton.y+buttonConfig.height) startGame();
        } else startGame();
    }
}

function startGame(){
    gameState="playing";
    bird.y=canvas.height/2-20;
    bird.velocity=0;
    bird.rotation=0;
    pipes.length=0;
    score=0;
    frameCount=0;
    pipeGap = canvas.height * 0.32; // recalc gap in case of resize
}

function addPipe(){
    const topHeight = Math.random()*(canvas.height - pipeGap - 50)+50;
    pipes.push({x:canvas.width,y:0,width:pipeWidth,height:topHeight,passed:false});
    pipes.push({x:canvas.width,y:topHeight+pipeGap,width:pipeWidth,height:canvas.height-(topHeight+pipeGap),passed:false});
}

function resetGame(){
    gameState="gameOver";
}

function drawBird(){
    // Scale bird relative to canvas height
    const birdWidth = canvas.height * 0.06;
    const birdHeight = canvas.height * 0.05;

    ctx.save();
    ctx.translate(bird.x+birdWidth/2, bird.y+birdHeight/2);
    ctx.rotate(bird.rotation);
    ctx.drawImage(birdImg,-birdWidth/2,-birdHeight/2,birdWidth,birdHeight);
    ctx.restore();
}

function drawButton(x,y,text){
    const width = buttonConfig.width;
    const height = buttonConfig.height;
    const radius = buttonConfig.radius;

    ctx.fillStyle=buttonConfig.color;
    ctx.shadowColor="black";
    ctx.shadowBlur=buttonConfig.shadowBlur;
    ctx.beginPath();
    ctx.moveTo(x+radius,y);
    ctx.lineTo(x+width-radius,y);
    ctx.quadraticCurveTo(x+width,y,x+width,y+radius);
    ctx.lineTo(x+width,y+height-radius);
    ctx.quadraticCurveTo(x+width,y+height,x+width-radius,y+height);
    ctx.lineTo(x+radius,y+height);
    ctx.quadraticCurveTo(x,y+height,x,y+height-radius);
    ctx.lineTo(x,y+radius);
    ctx.quadraticCurveTo(x,y,x+radius,y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur=0;

    ctx.fillStyle=buttonConfig.font;
    ctx.font=`${buttonConfig.fontSize}px Comic Sans MS`;
    ctx.textAlign="center";
    ctx.fillText(text,x+width/2,y+height/1.8);
}

function drawMenu(){
    ctx.drawImage(backgroundImg,0,0,canvas.width,canvas.height);
    ctx.fillStyle="#FFD700";
    ctx.font=`${Math.floor(canvas.width/10)}px Comic Sans MS`;
    ctx.textAlign="center";
    ctx.shadowColor="black";
    ctx.shadowBlur=15;
    ctx.fillText("FLAPPY BIRD",canvas.width/2,canvas.height/4);
    ctx.shadowBlur=0;
    drawButton(playButton.x,playButton.y,"PLAY");
}

function drawGameOver(){
    ctx.drawImage(backgroundImg,0,0,canvas.width,canvas.height);
    ctx.fillStyle="#FF4500";
    ctx.font=`${Math.floor(canvas.width/15)}px Comic Sans MS`;
    ctx.textAlign="center";
    ctx.shadowColor="black";
    ctx.shadowBlur=10;
    ctx.fillText("GAME OVER",canvas.width/2,canvas.height/3);
    ctx.shadowBlur=0;
    ctx.fillStyle="white";
    ctx.font=`${Math.floor(canvas.width/25)}px Comic Sans MS`;
    ctx.fillText(`Score: ${score}`,canvas.width/2,canvas.height/2);
    drawButton(restartButton.x,restartButton.y,"RESTART");
}

function gameLoop(){
    frameCount++;
    ctx.drawImage(backgroundImg,0,0,canvas.width,canvas.height);

    bird.velocity+=gravity;
    bird.y+=bird.velocity;
    bird.rotation+=0.03;
    if(bird.rotation>1) bird.rotation=1;
    drawBird();

    if(frameCount%130===0) addPipe();

    pipes.forEach(pipe=>pipe.x-=2.3);
    pipes.forEach(pipe=>{
        const pipeHeight = pipe.height;
        if(pipe.y===0){
            ctx.save();
            ctx.translate(pipe.x+pipe.width/2,pipeHeight/2);
            ctx.scale(1,-1);
            ctx.drawImage(pipeImg,-pipe.width/2,-pipeHeight/2,pipe.width,pipeHeight);
            ctx.restore();
        }else{
            ctx.drawImage(pipeImg,pipe.x,pipe.y,pipe.width,pipeHeight);
        }
    });

    pipes.forEach(pipe=>{
        if(bird.x<pipe.x+pipe.width && bird.x+bird.width>pipe.x && bird.y<pipe.y+pipe.height && bird.y+bird.height>pipe.y) resetGame();
        if(!pipe.passed && pipe.y!==0 && pipe.x+pipe.width<bird.x){
            pipe.passed=true;
            score++;
        }
    });

    for(let i=pipes.length-1;i>=0;i--) if(pipes[i].x+pipes[i].width<0) pipes.splice(i,1);

    const bottomBuffer=5;
    if(bird.y<0 || bird.y+bird.height>canvas.height-bottomBuffer) resetGame();

    ctx.fillStyle="white";
    ctx.font=`${Math.floor(canvas.width/20)}px Comic Sans MS`;
    ctx.textAlign="left";
    ctx.fillText(`Score: ${score}`,20,50);
}

function update(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(gameState==="menu") drawMenu();
    else if(gameState==="playing") gameLoop();
    else if(gameState==="gameOver") drawGameOver();
    requestAnimationFrame(update);
}

update();
