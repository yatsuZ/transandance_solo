-- Migration: Ajouter la colonne controls à la table users
-- Cette colonne stocke les préférences de contrôles clavier en JSON

ALTER TABLE users ADD COLUMN controls TEXT DEFAULT '{"leftUp":"w","leftDown":"s","rightUp":"ArrowUp","rightDown":"ArrowDown"}';
