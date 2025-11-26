import { Point, Paddle, Ball } from '../../../srcs/static/js/pong/components/geometry';

// ========================================
// TESTS PADDLE - Mouvement et Limites
// ========================================

describe('Paddle - Mouvement', () => {
  const mockField = { width: 1000, height: 750 };
  const speed = 10;

  test('La paddle ne peut PAS sortir du bord supérieur (y >= 0)', () => {
    const paddle = new Paddle('L', mockField, speed);

    // Forcer la paddle tout en haut
    paddle.position.setY(5);
    paddle.moveUp();

    expect(paddle.position.y).toBe(0); // Bloquée à 0
  });

  test('La paddle ne peut PAS sortir du bord inférieur', () => {
    const paddle = new Paddle('L', mockField, speed);
    const maxY = mockField.height - paddle.height;

    // Forcer la paddle tout en bas
    paddle.position.setY(maxY - 5);
    paddle.moveDown();

    expect(paddle.position.y).toBe(maxY); // Bloquée au max
  });

  test('Le resize garde la paddle dans les limites du terrain', () => {
    const paddle = new Paddle('L', mockField, speed);
    paddle.position.setY(700); // Près du bord

    const newField = { width: 500, height: 375 }; // Terrain plus petit
    paddle.resize(newField);

    const maxY = newField.height - paddle.height;
    expect(paddle.position.y).toBeLessThanOrEqual(maxY);
    expect(paddle.position.y).toBeGreaterThanOrEqual(0);
  });
});

// ========================================
// TESTS BALL - Physique et Rebonds
// ========================================

describe('Ball - Rebonds sur les bords', () => {
  const mockField = { width: 1000, height: 750 };

  test('La balle rebondit sur le bord SUPERIEUR (inverse speedY)', () => {
    const ball = new Ball(mockField);
    const radius = ball['radius'];

    ball.y = radius / 2; // Très proche du bord
    ball['speedY'] = -5; // Va vers le haut

    ball.update(mockField.width, mockField.height);

    expect(ball['speedY']).toBe(5); // Direction inversée
  });

  test('La balle rebondit sur le bord INFERIEUR (inverse speedY)', () => {
    const ball = new Ball(mockField);
    const radius = ball['radius'];

    ball.y = mockField.height - radius / 2; // Près du bas
    ball['speedY'] = 5; // Va vers le bas

    ball.update(mockField.width, mockField.height);

    expect(ball['speedY']).toBe(-5); // Direction inversée
  });
});

describe('Ball - Reset', () => {
  const mockField = { width: 1000, height: 750 };

  test('Le reset remet la balle au centre du terrain', () => {
    const ball = new Ball(mockField);

    // Déplacer la balle n'importe où
    ball.x = 100;
    ball.y = 200;
    ball.isVisible = false;
    ball['currentSpeedMultiplier'] = 1.4;

    ball.reset(mockField.width, mockField.height);

    expect(ball.x).toBe(500); // Centre X
    expect(ball.y).toBe(375); // Centre Y
    expect(ball.isVisible).toBe(true);
    expect(ball['currentSpeedMultiplier']).toBe(1); // Vitesse réinitialisée
  });
});

// ========================================
// TESTS COLLISION - Détection et Rebond
// ========================================

describe('Ball - Collision avec Paddle', () => {
  const mockField = { width: 1000, height: 750 };

  test('Détecte une collision avec la paddle GAUCHE', () => {
    const ball = new Ball(mockField);
    const paddle = new Paddle('L', mockField, 10, 20);

    // Positionner la balle pile sur la paddle
    ball.x = paddle.position.x + paddle.width + 2;
    ball.y = paddle.position.y + paddle.height / 2;
    ball['speedX'] = -5; // Va vers la gauche

    expect(ball.collidesWith(paddle)).toBe(true);
  });

  test('Détecte une collision avec la paddle DROITE', () => {
    const ball = new Ball(mockField);
    const paddle = new Paddle('R', mockField, 10, 20);

    ball.x = paddle.position.x - 2;
    ball.y = paddle.position.y + paddle.height / 2;
    ball['speedX'] = 5; // Va vers la droite

    expect(ball.collidesWith(paddle)).toBe(true);
  });

  test('NE détecte PAS de collision si la balle est trop haute', () => {
    const ball = new Ball(mockField);
    const paddle = new Paddle('L', mockField, 10, 20);

    ball.x = paddle.position.x + paddle.width;
    ball.y = paddle.position.y - 50; // Au-dessus de la paddle
    ball['speedX'] = -5;

    expect(ball.collidesWith(paddle)).toBe(false);
  });

  test('NE détecte PAS de collision si la balle va dans le mauvais sens', () => {
    const ball = new Ball(mockField);
    const paddle = new Paddle('L', mockField, 10, 20);

    ball.x = paddle.position.x + paddle.width;
    ball.y = paddle.position.y + paddle.height / 2;
    ball['speedX'] = 5; // S'éloigne de la paddle (mauvais sens)

    expect(ball.collidesWith(paddle)).toBe(false);
  });
});

describe('Ball - Comportement du rebond', () => {
  const mockField = { width: 1000, height: 750 };

  test('Le rebond INVERSE la direction horizontale (speedX)', () => {
    const ball = new Ball(mockField);
    const paddle = new Paddle('L', mockField, 10, 20);

    ball['speedX'] = -5;
    ball.bounce(paddle);

    expect(ball['speedX']).toBeGreaterThan(0); // Maintenant positif
  });

  test('Le rebond AUGMENTE la vitesse progressivement', () => {
    const ball = new Ball(mockField);
    const paddle = new Paddle('L', mockField, 10, 20);

    const multiplierAvant = ball['currentSpeedMultiplier'];
    ball.bounce(paddle);
    const multiplierApres = ball['currentSpeedMultiplier'];

    expect(multiplierApres).toBeGreaterThan(multiplierAvant);
  });

  test('La vitesse ne dépasse JAMAIS le maximum (1.5x)', () => {
    const ball = new Ball(mockField);
    const paddle = new Paddle('L', mockField, 10, 20);

    // Forcer au max
    ball['currentSpeedMultiplier'] = 1.5;
    ball.bounce(paddle);

    expect(ball['currentSpeedMultiplier']).toBeLessThanOrEqual(1.5);
  });

  test('Impact en HAUT de la paddle = angle plus prononcé', () => {
    const ball = new Ball(mockField);
    const paddle = new Paddle('L', mockField, 10, 20);

    // Impact tout en haut
    ball.y = paddle.position.y + 5;
    ball.bounce(paddle);
    const speedYHaut = ball['speedY'];

    // Impact au centre
    ball['currentSpeedMultiplier'] = 1; // Reset
    ball.y = paddle.position.y + paddle.height / 2;
    ball.bounce(paddle);
    const speedYCentre = ball['speedY'];

    // L'angle devrait être plus prononcé en haut
    expect(Math.abs(speedYHaut)).toBeGreaterThan(Math.abs(speedYCentre));
  });
});

// ========================================
// TESTS RESIZE - Adaptation responsive
// ========================================

describe('Resize - Adaptation du terrain', () => {
  const mockField = { width: 1000, height: 750 };

  test('La balle garde sa position proportionnelle après resize', () => {
    const ball = new Ball(mockField);
    ball.x = 250; // 25% de la largeur
    ball.y = 375; // 50% de la hauteur

    const newField = { width: 2000, height: 1500 };
    ball.resize(newField);

    expect(ball.x).toBe(500);  // 25% de 2000
    expect(ball.y).toBe(750);  // 50% de 1500
  });

  test('La paddle DROITE se repositionne correctement après resize', () => {
    const paddle = new Paddle('R', mockField, 10, 20);
    const initialX = paddle.position.x;

    const newField = { width: 2000, height: 1500 };
    paddle.resize(newField);

    // La paddle droite doit être à : newWidth - paddleWidth - offset
    const expectedX = 2000 - paddle.width - 20;
    expect(paddle.position.x).toBeCloseTo(expectedX);
  });

  test('Le rayon de la balle s\'adapte proportionnellement', () => {
    const ball = new Ball(mockField);
    const radiusInitial = ball['radius'];

    const newField = { width: 2000, height: 1500 }; // 2x plus grand
    ball.resize(newField);

    expect(ball['radius']).toBeCloseTo(radiusInitial * 2);
  });
});

// ========================================
// TESTS POINT - Classe utilitaire
// ========================================

describe('Point - Construction et manipulation', () => {
  test('Créer un point à partir d\'un autre point', () => {
    const p1 = new Point(10, 20);
    const p2 = new Point(p1);

    expect(p2.x).toBe(10);
    expect(p2.y).toBe(20);

    // Vérifier que c'est une copie indépendante
    p1.x = 100;
    expect(p2.x).toBe(10); // p2 ne change pas
  });

  test('setPoint avec un autre point', () => {
    const p1 = new Point(5, 5);
    const p2 = new Point(50, 60);

    p1.setPoint(p2);

    expect(p1.x).toBe(50);
    expect(p1.y).toBe(60);
  });
});
