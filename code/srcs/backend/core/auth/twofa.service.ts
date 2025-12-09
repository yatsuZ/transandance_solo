import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export class TwoFAService {
  static generateSecret(): string {
    return authenticator.generateSecret();
  }

  static generateOtpAuthURL(username: string, secret: string): string {
    return authenticator.keyuri(
      username,
      'Transcendance Pong',
      secret
    );
  }

  static async generateQRCode(otpAuthURL: string): Promise<string> {
    try {
      return await QRCode.toDataURL(otpAuthURL);
    } catch (err) {
      throw new Error('Erreur lors de la generation du QR code');
    }
  }

  static verifyToken(token: string, secret: string): boolean {
    if (!token || token.length !== 6) {
      return false;
    }

    try {
      return authenticator.verify({ token, secret });
    } catch (err) {
      return false;
    }
  }
}
