export function init_canvas() {
  const canvas = document.getElementById('pong-canvas');
  const ctx = canvas.getContext('2d');
  const parent = canvas.parentElement;

  // console.log(parent); // Affiche la balise parente dans la console

  // Définir un ratio fixe pour garder les proportions
  const RATIO = 4 / 3; // 800x600 par exemple
  
  function resizeCanvas() {
    const maxWidth = parent.clientWidth;
    const maxHeight = parent.clientHeight;
    
    // On garde le bon ratio
    let width = maxWidth;
    let height = width / RATIO;
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * RATIO;
    }
    
    // On met à jour la taille du canvas
    canvas.width = width;
    canvas.height = height;
    
    // Optionnel : redessine ton jeu à la bonne échelle
    // draw();
  }
  
  window.addEventListener('load', resizeCanvas);
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}
