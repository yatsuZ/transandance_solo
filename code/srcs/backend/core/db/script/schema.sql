-- ========================================
-- SCHEMA - Base de données Pong
-- ========================================
-- Contient toutes les tables pour le jeu de Pong
-- - users : Utilisateurs enregistrés (PAS les IA)
-- - matches : Historique des matchs (PvP et PvIA seulement)
-- - tournaments : Tournois avec participants

-- Activer les clés étrangères (important pour SQLite)
PRAGMA foreign_keys = ON;

-- ========================================
-- TABLE: users
-- ========================================
-- Stocke les utilisateurs enregistrés
-- Les IA ne sont PAS dans cette table (gérées directement dans matches)

CREATE TABLE IF NOT EXISTS users (
  -- Identité
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(16) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),  -- Nullable pour Google OAuth (comptes Google n'ont pas de mot de passe)

  -- Profil
  avatar_url VARCHAR(255) DEFAULT '/static/util/icon/profile.png',

  -- Stats (stockées et mises à jour après chaque match)
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_goals_scored INTEGER DEFAULT 0,
  total_goals_conceded INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  tournaments_played INTEGER DEFAULT 0,
  tournaments_won INTEGER DEFAULT 0,

  -- Social
  friend_count INTEGER DEFAULT 0,

  -- Customization
  controls TEXT DEFAULT '{"leftUp":"w","leftDown":"s","leftLeft":"a","leftRight":"d","rightUp":"ArrowUp","rightDown":"ArrowDown","rightLeft":"ArrowLeft","rightRight":"ArrowRight"}',

  -- Music Preferences
  music_volume INTEGER DEFAULT 50,  -- Volume 0-100
  music_enabled INTEGER DEFAULT 0,  -- 0=popup à afficher, 1=musique autorisée, 2=musique refusée

  -- Online Status
  is_online INTEGER DEFAULT 0,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Two-Factor Authentication
  twofa_secret TEXT DEFAULT NULL,
  twofa_enabled INTEGER DEFAULT 0,

  -- Google OAuth
  google_id TEXT DEFAULT NULL UNIQUE,  -- ID Google (NULL si compte classique)

  -- Meta
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABLE: matches
-- ========================================
-- Stocke l'historique des matchs (PvP et PvIA uniquement, PAS IAvIA)
-- Un match peut avoir 3 états : 'in_progress', 'completed', 'leave'

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Joueur Gauche (NULL si IA ou Guest)
  player_left_id INTEGER,
  player_left_name VARCHAR(16) NOT NULL,
  is_bot_left BOOLEAN DEFAULT 0,             -- 1 si bot, 0 sinon
  score_left INTEGER DEFAULT 0,

  -- Joueur Droite (NULL si IA ou Guest)
  player_right_id INTEGER,
  player_right_name VARCHAR(16) NOT NULL,
  is_bot_right BOOLEAN DEFAULT 0,            -- 1 si bot, 0 sinon
  score_right INTEGER DEFAULT 0,

  -- Résultat (NULL si pas fini ou si leave)
  winner_id INTEGER,
  winner_name VARCHAR(16),

  -- État du match
  status VARCHAR(20) DEFAULT 'in_progress',  -- 'in_progress', 'completed', 'leave'

  -- Meta
  game_type VARCHAR(10) DEFAULT 'pong',      -- 'pong' ou 'tron'
  start_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_at DATETIME,                           -- NULL jusqu'à la fin

  FOREIGN KEY (player_left_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (player_right_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================================
-- TABLE: tournaments
-- ========================================
-- Stocke les tournois créés par les users
-- Un tournoi peut avoir 3 statuts : 'in_progress', 'completed', 'leave'
-- matches_remaining décrémente de nbr_of_matches → 0

CREATE TABLE IF NOT EXISTS tournaments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Gestion
  manager_id INTEGER NOT NULL,              -- User qui a créé/organisé le tournoi
  winner_participant_id INTEGER,            -- Participant gagnant (peut être user/guest/bot)

  -- Progression
  nbr_of_matches INTEGER DEFAULT 3,         -- Nombre total de matches (constant, ex: 3 pour 4 joueurs)
  matches_remaining INTEGER DEFAULT 3,      -- Matches restants (décrémente jusqu'à 0)
  status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'leave'

  -- Meta
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_at DATETIME,                          -- NULL jusqu'à la fin

  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
  -- Si manager supprimé → tournoi supprimé

  FOREIGN KEY (winner_participant_id) REFERENCES tournament_participants(id) ON DELETE SET NULL
  -- Si winner supprimé → winner_participant_id devient NULL
);

-- ========================================
-- TABLE: tournament_participants
-- ========================================
-- Stocke les participants d'un tournoi (users, guests ou bots)
-- Si user_id = NULL + is_bot = 0 → Guest
-- Si user_id = NULL + is_bot = 1 → Bot
-- Si user_id rempli → User (display_name peut être différent du username)

CREATE TABLE IF NOT EXISTS tournament_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,

  -- Identité du participant
  user_id INTEGER,                    -- NULL si Guest ou Bot
  display_name VARCHAR(16) NOT NULL,  -- Pseudo affiché (user peut choisir un pseudo différent)
  is_bot BOOLEAN DEFAULT 0,           -- 1 si c'est un bot, 0 sinon

  -- Progression
  placement INTEGER,                  -- Position finale : 1er, 2e, 3e, 4e (constant une fois set)
  is_eliminated BOOLEAN DEFAULT 0,    -- 0 = encore en lice, 1 = éliminé

  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  -- Si tournoi supprimé → participants supprimés automatiquement

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  -- Si user supprimé → user_id devient NULL mais participant reste (display_name gardé)
);

-- ========================================
-- TABLE: tournament_matches
-- ========================================
-- Lie les matches à un tournoi avec un index
-- match_index décrémente : 3 (semi-final 1) → 2 (semi-final 2) → 1 (final) → 0 (fini)
-- Permet de scaler facilement (8 joueurs = 7 matches, etc.)

CREATE TABLE IF NOT EXISTS tournament_matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,
  match_id INTEGER NOT NULL,

  -- Index et round
  match_index INTEGER NOT NULL,       -- 3, 2, 1 (0 = plus de match)
  round VARCHAR(20),                  -- 'semi-final-1', 'semi-final-2', 'final'

  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  -- Si tournoi supprimé → matches du tournoi supprimés

  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
  -- Si match supprimé → lien supprimé
);

-- ========================================
-- TABLE: friendships (ajouté par migration 002)
-- ========================================
-- Stocke les relations d'amitié entre utilisateurs
-- Note: La relation est bidirectionnelle (si A est ami avec B, B est ami avec A)
-- Mais on stocke une seule ligne avec user_id < friend_id pour éviter les doublons

CREATE TABLE IF NOT EXISTS friendships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Les deux utilisateurs (toujours user_id < friend_id)
  user_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,

  -- Meta
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Contraintes
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,

  -- Empêcher les doublons
  UNIQUE(user_id, friend_id),

  -- S'assurer que user_id < friend_id
  CHECK(user_id < friend_id)
);

-- ========================================
-- INDEX: Optimiser les recherches d'amis
-- ========================================
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
