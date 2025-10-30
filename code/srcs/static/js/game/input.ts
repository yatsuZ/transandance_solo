export class InputHandler {
  public upPressed = false;
  public downPressed = false;

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') this.upPressed = true;
      if (e.key === 'ArrowDown') this.downPressed = true;
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowUp') this.upPressed = false;
      if (e.key === 'ArrowDown') this.downPressed = false;
    });
  }
}