-- Migration: Ajouter le système d'amitié
-- Cette migration ajoute:
-- 1. La table friendships pour gérer les relations d'amitié
-- 2. La colonne friend_count dans users pour optimiser les requêtes

-- ========================================
-- Étape 1: Ajouter la colonne friend_count à users
-- ========================================
ALTER TABLE users ADD COLUMN friend_count INTEGER DEFAULT 0;

-- ========================================
-- Étape 2: Créer la table friendships
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
-- Étape 3: Créer un index pour optimiser les recherches
-- ========================================
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
