import anime from 'https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.es.js';

export function animation_changement_de_page() {
  // ton animation
  anime({
    targets: '#app .container .arcade-header .arcade-title',
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: 500
  });
  anime({
    targets: '#app .container .arcade-header .arcade-subtitle',
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: 500
  });
}