-- Migration: Add online status tracking
-- Date: 2025-12-03
-- Purpose: Track user online/offline status and last activity time

-- Add is_online column (1 = online, 0 = offline)
ALTER TABLE users ADD COLUMN is_online INTEGER DEFAULT 0;

-- Add last_seen column (timestamp of last activity)
ALTER TABLE users ADD COLUMN last_seen DATETIME DEFAULT CURRENT_TIMESTAMP;
