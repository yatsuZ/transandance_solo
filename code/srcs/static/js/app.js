document.addEventListener('DOMContentLoaded', () => { 
  const container = document.getElementById('app');

  // Event delegation : on écoute tout le body
  document.body.addEventListener('click', async (e) => {
    const link = e.target.closest('a[data-link]');
    if (!link) return; // pas un lien data-link

    e.preventDefault();
    const url = link.getAttribute('href');

    // fetch de la vue
    const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    const html = await res.text();

    // remplace le contenu du container
    container.innerHTML = html;

    // anime.js animation
    anime({
      targets: '#app .container',
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 500
    });
  });
});
