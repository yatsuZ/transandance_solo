-- Migration 004: Ajout du support 2FA (Two-Factor Authentication)

-- Ajouter colonne pour stocker le secret TOTP (null si 2FA pas configuré)
ALTER TABLE users ADD COLUMN twofa_secret TEXT DEFAULT NULL;

-- Ajouter colonne pour activer/désactiver 2FA (0 = désactivé, 1 = activé)
ALTER TABLE users ADD COLUMN twofa_enabled INTEGER DEFAULT 0;
