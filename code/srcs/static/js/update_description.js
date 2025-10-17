export function update_description_de_page() {
  const subtitle = document.querySelector('.arcade-subtitle');
  const buttons = document.querySelectorAll('button');

  const texts = {
    default: 'Que veux-tu faire ?',
    go_to_match: '🎮 Jouer à Pong contre une IA — le premier à 3 gagne !',
    go_to_tournament: '🏆 Configure ton tournoi, que le meilleur gagne !',
    go_to_accueil: `🏠 Retour à l'accueil`,
    interupteur_du_son : `Mettre le son OU l'arrete.`,
    parametre : `acceder aux parametre.`
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
    if (button.dataset)
    {
      button.addEventListener('mouseenter', () => {
        changeSubtitle(texts[button.dataset.link]);
      });
      
      button.addEventListener('mouseleave', () => {
        changeSubtitle(texts.default);
      });
    }
  });
}
