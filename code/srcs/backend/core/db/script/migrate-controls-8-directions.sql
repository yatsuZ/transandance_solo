-- ========================================
-- MIGRATION: Add left/right controls
-- ========================================
-- Mise à jour des contrôles pour inclure gauche/droite
-- pour tous les users existants

-- Pour chaque utilisateur, on parse le JSON, on ajoute les champs manquants, et on met à jour
UPDATE users
SET controls = json_insert(
  json_insert(
    json_insert(
      json_insert(
        controls,
        '$.leftLeft', 'a'
      ),
      '$.leftRight', 'd'
    ),
    '$.rightLeft', 'ArrowLeft'
  ),
  '$.rightRight', 'ArrowRight'
)
WHERE json_extract(controls, '$.leftLeft') IS NULL;
