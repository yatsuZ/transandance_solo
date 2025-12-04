/**
 * Service 2FA (Two-Factor Authentication)
 * Gère la génération et vérification des codes TOTP (Time-based One-Time Password)
 */

import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export class TwoFAService {
  /**
   * Génère un secret unique pour l'utilisateur
   * Ce secret sera partagé entre le serveur et l'app d'authentification
   * @returns Secret au format base32
   */
  static generateSecret(): string {
    console.log('[TwoFAService] 🔑 Génération d\'un nouveau secret TOTP');
    const secret = authenticator.generateSecret();
    console.log(`[TwoFAService] ✅ Secret généré (longueur: ${secret.length})`);
    return secret;
  }

  /**
   * Génère l'URL otpauth pour le QR code
   * Format: otpauth://totp/Transcendance:username?secret=XXX&issuer=Transcendance
   * @param username - Nom d'utilisateur
   * @param secret - Secret TOTP
   * @returns URL otpauth
   */
  static generateOtpAuthURL(username: string, secret: string): string {
    console.log(`[TwoFAService] 🔗 Génération URL otpauth pour user: ${username}`);
    const otpAuthURL = authenticator.keyuri(
      username,
      'Transcendance Pong',
      secret
    );
    console.log(`[TwoFAService] ✅ URL générée: ${otpAuthURL.substring(0, 50)}...`);
    return otpAuthURL;
  }

  /**
   * Génère le QR code en base64 (image)
   * Ce QR code sera scanné par Google Authenticator / Authy
   * @param otpAuthURL - URL otpauth générée
   * @returns QR code en base64 (data:image/png;base64,...)
   */
  static async generateQRCode(otpAuthURL: string): Promise<string> {
    console.log('[TwoFAService] 📱 Génération du QR code');
    try {
      const qrCodeDataURL = await QRCode.toDataURL(otpAuthURL);
      console.log('[TwoFAService] ✅ QR code généré avec succès');
      return qrCodeDataURL;
    } catch (err) {
      console.error('[TwoFAService] ❌ Erreur lors de la génération du QR code:', err);
      throw new Error('Erreur lors de la génération du QR code');
    }
  }

  /**
   * Vérifie un code TOTP saisi par l'utilisateur
   * Le code est valide pendant 30 secondes
   * @param token - Code à 6 chiffres saisi par l'utilisateur
   * @param secret - Secret TOTP de l'utilisateur
   * @returns true si le code est valide, false sinon
   */
  static verifyToken(token: string, secret: string): boolean {
    console.log(`[TwoFAService] 🔍 Vérification du code 2FA: ${token}`);

    if (!token || token.length !== 6) {
      console.log('[TwoFAService] ❌ Code invalide (format incorrect)');
      return false;
    }

    try {
      const isValid = authenticator.verify({ token, secret });
      console.log(`[TwoFAService] ${isValid ? '✅' : '❌'} Code ${isValid ? 'valide' : 'invalide'}`);
      return isValid;
    } catch (err) {
      console.error('[TwoFAService] ❌ Erreur lors de la vérification:', err);
      return false;
    }
  }
}
