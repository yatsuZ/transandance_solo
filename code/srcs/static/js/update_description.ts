export function update_description_de_page() {
  const subtitle = document.querySelector('.arcade-subtitle');
  if (!subtitle) {
    console.warn('update_description_de_page: .arcade-subtitle element not found');
    return;
  }
  // Cast to a concrete HTMLElement now that we've checked for null
  const subtitleEl = subtitle as HTMLElement;

  const buttons = document.querySelectorAll('button');

  const texts = {
    default: 'Que veux-tu faire ?',
    go_to_match: '🎮 Jouer à Pong contre une IA — le premier à 3 gagne !',
    go_to_tournament: '🏆 Configure ton tournoi, que le meilleur gagne !',
    go_to_accueil: `🏠 Retour à l'accueil`,
    interupteur_du_son : `Mettre le son OU l'arrete.`,
    parametre : `acceder aux parametre.`
  };

  function changeSubtitle(newText : string) {
    // Lancer un fondu de sortie
    subtitleEl.classList.add('fade-out');
    
    // Attendre que le fondu se termine avant de changer le texte
    setTimeout(() => {
      subtitleEl.textContent = newText;
      subtitleEl.classList.remove('fade-out');
    }, 400); // doit correspondre à la durée du "transition" CSS
  }

  buttons.forEach(button => {
    if (button.dataset)
    {
      button.addEventListener('mouseenter', () => {
        const link = (button as HTMLButtonElement).dataset.link as keyof typeof texts | undefined;
        const newText = link && link in texts ? texts[link] : texts.default;
        changeSubtitle(newText);
      });
      
      button.addEventListener('mouseleave', () => {
        changeSubtitle(texts.default);
      });
    }
  });
}
