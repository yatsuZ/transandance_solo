
// On cast window.anime en type callable
const animeGlobal = (window as any).anime as (params: any) => any;

export function animation_changement_de_page() {
  animeGlobal({
    targets: '#app .container .arcade-header .arcade-title',
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: 500
  });
  
  animeGlobal({
    targets: '#app .container .arcade-header .arcade-subtitle',
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: 500
  });
}
