export function update_description_de_page() {
  const subtitle = document.querySelector('.arcade-subtitle');
  const buttons = document.querySelectorAll('.menu-buttons button');

  const texts = {
    default: 'Que veux-tu faire ?',
    match: '🎮 Jouer à Pong contre une IA — le premier à 3 gagne !',
    tournament: '🏆 Configure ton tournoi, que le meilleur gagne !'
  };

  function changeSubtitle(newText) {
    // Lancer un fondu de sortie
    subtitle.classList.add('fade-out');
    
    // Attendre que le fondu se termine avant de changer le texte
    setTimeout(() => {
      subtitle.textContent = newText;
      subtitle.classList.remove('fade-out');
    }, 400); // doit correspondre à la durée du "transition" CSS
  }

  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      changeSubtitle(texts[button.dataset.link]);
    });

    button.addEventListener('mouseleave', () => {
      changeSubtitle(texts.default);
    });
  });
}
