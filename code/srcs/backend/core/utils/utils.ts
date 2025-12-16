import { Logger } from "./logger";

export function showLog(): boolean {
  return  process.env.NODE_ENV !== 'test';
}

/**
 * Parse et valide la taille max des fichiers uploadés
 * @param envValue - Valeur du .env (ex: "5MB", "500KB", "5242880")
 * @param defaultBytes - Valeur par défaut en octets, MB default
 * @param maxAllowed - Limite maximale autorisée en octets, 50MB default
*/
export function parseFileSize(
    envValue: string | undefined,
    defaultBytes: number = 5 * 1024 * 1024,// 5 MB
    maxAllowed: number = 50 * 1024 * 1024// 50 MB
  ): number {
    if (!envValue)
    {
      Logger.debug(`[Config] NO MAX_FILE_SIZE given by env`);
      return defaultBytes;
    }

    const value = envValue.trim().toUpperCase();

    // Patterns supportés: "5MB", "500KB", "5242880"
    const match = value.match(/^(\d+(?:\.\d+)?)\s*(KB|MB|GB)?$/);

    if (!match) {
      Logger.debug(`[Config] MAX_FILE_SIZE invalide: "${envValue}", utilisation de ${defaultBytes} octets`);
      return defaultBytes;
    }

    const num = parseFloat(match[1]);
    const unit = match[2];

    let bytes: number;
    switch (unit) {
      case 'KB': bytes = num * 1024; break;
      case 'MB': bytes = num * 1024 * 1024; break;
      case 'GB': bytes = num * 1024 * 1024 * 1024; break;
      default:   bytes = num; // Pas d'unité = octets
    }

    // Sécurité : limiter à une valeur max raisonnable
    if (bytes > maxAllowed) {
      Logger.debug(`[Config] MAX_FILE_SIZE (${envValue}) dépasse la limite de ${maxAllowed / (1024 * 1024)}MB, limité à ${maxAllowed / (1024 * 1024)}MB`);
      return maxAllowed;
    }

    if (bytes < 1024) {
      Logger.debug(`[Config] MAX_FILE_SIZE trop petit (${bytes} octets), minimum 1KB`);
      return 1024;
    }

    return Math.floor(bytes);
}