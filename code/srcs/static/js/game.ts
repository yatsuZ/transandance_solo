export function init_canvas() {
  const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement | null;
  if (!canvas) return console.error('Canvas element with id "pong-canvas" not found');
  const ctx = canvas.getContext('2d');
  if (!ctx) return console.error('2D context not found');

  const parent = canvas.parentElement;
  if (!parent) return console.error('Canvas parent element not found');

  const RATIO = 4 / 3;

  function resizeCanvas() {
    if (!parent) return console.error('Canvas parent element not found');
    if (!canvas) return console.error('Canvas element with id "pong-canvas" not found');

    const maxWidth = parent.clientWidth;
    const maxHeight = parent.clientHeight;
    let width = maxWidth;
    let height = width / RATIO;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * RATIO;
    }
    canvas.width = width;
    canvas.height = height;
  }

  window.addEventListener('load', resizeCanvas);
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // === VARIABLES DU JEU ===
  const paddleWidth = 10;
  const paddleHeight = 80;
  const paddleOffset = 20;

  let playerY = canvas.height / 2 - paddleHeight / 2;
  let aiY = canvas.height / 2 - paddleHeight / 2;

  let ballX = canvas.width / 2;
  let ballY = canvas.height / 2;
  let ballSpeedX = 4;
  let ballSpeedY = 3;
  let playerScore = 0;
  let aiScore = 0;

  // === CONTROLES FLUIDES ===
  let upPressed = false;
  let downPressed = false;
  const playerSpeed = 6;

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') upPressed = true;
    if (e.key === 'ArrowDown') downPressed = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') upPressed = false;
    if (e.key === 'ArrowDown') downPressed = false;
  });

  function resetBall() {
    if (!canvas) return console.error('Canvas element with id "pong-canvas" not found');

    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = -ballSpeedX;
    ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
  }

  function update() {
    if (!canvas) return console.error('Canvas element with id "pong-canvas" not found');
    // 🔹 Mouvement fluide du joueur
    if (upPressed) playerY -= playerSpeed;
    if (downPressed) playerY += playerSpeed;

    // Limites du terrain
    if (playerY < 0) playerY = 0;
    if (playerY + paddleHeight > canvas.height) playerY = canvas.height - paddleHeight;

    // 🔹 Balle
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY < 0 || ballY > canvas.height) ballSpeedY = -ballSpeedY;

    // 🔹 Collisions raquettes
    if (
      ballX < paddleOffset + paddleWidth &&
      ballY > playerY &&
      ballY < playerY + paddleHeight
    ) {
      ballSpeedX = -ballSpeedX;
    }

    if (
      ballX > canvas.width - paddleWidth - paddleOffset &&
      ballY > aiY &&
      ballY < aiY + paddleHeight
    ) {
      ballSpeedX = -ballSpeedX;
    }

    // 🔹 Points
    if (ballX < 0) {
      aiScore++;
      resetBall();
    }
    if (ballX > canvas.width) {
      playerScore++;
      resetBall();
    }

    // 🔹 Victoire
    if (playerScore >= 3 || aiScore >= 3) {
      alert(playerScore >= 3 ? '🎉 Vous avez gagné !' : '💀 Vous avez perdu !');
      playerScore = 0;
      aiScore = 0;
      resetBall();
    }

    // 🔹 IA suit la balle
    const aiCenter = aiY + paddleHeight / 2;
    if (aiCenter < ballY - 20) aiY += 3;
    else if (aiCenter > ballY + 20) aiY -= 3;
  }

  function draw() {
    if (!ctx) return console.error('2D context not found');
    if (!canvas) return console.error('Canvas element with id "pong-canvas" not found');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Balle
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Raquettes
    ctx.fillRect(paddleOffset, playerY, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - paddleWidth - paddleOffset, aiY, paddleWidth, paddleHeight);

    // Score
    ctx.font = `${canvas.height / 10}px monospace`;
    ctx.fillText(`${playerScore} - ${aiScore}`, canvas.width / 2 - 30, 50);
  }

  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  resetBall();
  gameLoop();
}
