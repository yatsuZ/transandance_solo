export class Game_Pong_Client {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private parent: HTMLElement;

  private readonly RATIO = 4 / 3;
  private readonly paddleWidth = 10;
  private readonly paddleHeight = 80;
  private readonly paddleOffset = 20;
  private readonly playerSpeed = 6;

  private playerY: number;
  private aiY: number;
  private ballX: number;
  private ballY: number;
  private ballSpeedX: number = 4;
  private ballSpeedY: number = 3;
  private playerScore: number = 0;
  private aiScore: number = 0;

  private upPressed: boolean = false;
  private downPressed: boolean = false;

  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) throw new Error(`Canvas element with id "${canvasId}" not found`);
    this.canvas = canvas;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('2D context not found');
    this.ctx = ctx;

    const parent = this.canvas.parentElement;
    if (!parent) throw new Error('Canvas parent element not found');
    this.parent = parent;

    // Position initiale des raquettes et de la balle
    this.playerY = this.canvas.height / 2 - this.paddleHeight / 2;
    this.aiY = this.canvas.height / 2 - this.paddleHeight / 2;
    this.ballX = this.canvas.width / 2;
    this.ballY = this.canvas.height / 2;

    this.initEvents();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.resetBall();
    this.gameLoop();
  }

  private initEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') this.upPressed = true;
      if (e.key === 'ArrowDown') this.downPressed = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowUp') this.upPressed = false;
      if (e.key === 'ArrowDown') this.downPressed = false;
    });
  }

  private resizeCanvas() {
    const maxWidth = this.parent.clientWidth;
    const maxHeight = this.parent.clientHeight;
    let width = maxWidth;
    let height = width / this.RATIO;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * this.RATIO;
    }
    this.canvas.width = width;
    this.canvas.height = height;

    // Ajuster la position des raquettes et de la balle après resize
    this.playerY = this.canvas.height / 2 - this.paddleHeight / 2;
    this.aiY = this.canvas.height / 2 - this.paddleHeight / 2;
    this.ballX = this.canvas.width / 2;
    this.ballY = this.canvas.height / 2;
  }

  private resetBall() {
    this.ballX = this.canvas.width / 2;
    this.ballY = this.canvas.height / 2;
    this.ballSpeedX = -this.ballSpeedX;
    this.ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
  }

  private update() {
    // Mouvement joueur
    if (this.upPressed) this.playerY -= this.playerSpeed;
    if (this.downPressed) this.playerY += this.playerSpeed;

    // Limites du terrain
    if (this.playerY < 0) this.playerY = 0;
    if (this.playerY + this.paddleHeight > this.canvas.height)
      this.playerY = this.canvas.height - this.paddleHeight;

    // Mouvement balle
    this.ballX += this.ballSpeedX;
    this.ballY += this.ballSpeedY;

    if (this.ballY < 0 || this.ballY > this.canvas.height) this.ballSpeedY = -this.ballSpeedY;

    // Collisions raquettes
    if (
      this.ballX < this.paddleOffset + this.paddleWidth &&
      this.ballY > this.playerY &&
      this.ballY < this.playerY + this.paddleHeight
    ) {
      this.ballSpeedX = -this.ballSpeedX;
    }

    if (
      this.ballX > this.canvas.width - this.paddleWidth - this.paddleOffset &&
      this.ballY > this.aiY &&
      this.ballY < this.aiY + this.paddleHeight
    ) {
      this.ballSpeedX = -this.ballSpeedX;
    }

    // Points
    if (this.ballX < 0) {
      this.aiScore++;
      this.resetBall();
    }
    if (this.ballX > this.canvas.width) {
      this.playerScore++;
      this.resetBall();
    }

    // Victoire
    if (this.playerScore >= 3 || this.aiScore >= 3) {
      alert(this.playerScore >= 3 ? '🎉 Vous avez gagné !' : '💀 Vous avez perdu !');
      this.playerScore = 0;
      this.aiScore = 0;
      this.resetBall();
    }

    // IA suit la balle
    const aiCenter = this.aiY + this.paddleHeight / 2;
    if (aiCenter < this.ballY - 20) this.aiY += 3;
    else if (aiCenter > this.ballY + 20) this.aiY -= 3;
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Balle
    this.ctx.fillStyle = 'black';
    this.ctx.beginPath();
    this.ctx.arc(this.ballX, this.ballY, 8, 0, Math.PI * 2);
    this.ctx.fill();

    // Raquettes
    this.ctx.fillRect(this.paddleOffset, this.playerY, this.paddleWidth, this.paddleHeight);
    this.ctx.fillRect(
      this.canvas.width - this.paddleWidth - this.paddleOffset,
      this.aiY,
      this.paddleWidth,
      this.paddleHeight
    );

    // Score
    this.ctx.font = `${this.canvas.height / 10}px monospace`;
    this.ctx.fillText(`${this.playerScore} - ${this.aiScore}`, this.canvas.width / 2 - 30, 50);
  }

  private gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}
