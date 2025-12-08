-- Migration 003: Ajouter les préférences musicales
-- Date: 2025-12-08
-- Description: Ajoute music_volume et music_enabled à la table users

-- Ajouter la colonne music_volume (volume 0-100, par défaut 50)
ALTER TABLE users ADD COLUMN music_volume INTEGER DEFAULT 50;

-- Ajouter la colonne music_enabled (0=popup, 1=oui, 2=non, par défaut 0)
ALTER TABLE users ADD COLUMN music_enabled INTEGER DEFAULT 0;
