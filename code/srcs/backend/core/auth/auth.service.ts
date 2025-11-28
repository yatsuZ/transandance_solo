import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'ATTENTion_YaSssine8JEdoisDefinirDansLesVariebleDenvirnementCArklacVisibleToutLemondeVoiiiitEtCpasBienPOurlasecu';
const JWT_EXPIRES_IN = '24h';
export interface JWTPayload {
  userId: number;
  username: string;
}

/**
 * Service d'authentification pour gérer les mots de passe et les JWT
 */
export class AuthService {
  /**
   * Hashe un mot de passe avec bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Vérifie si un mot de passe correspond au hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Génère un JWT token
   */
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Vérifie et décode un JWT token
   */
  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  }
}
