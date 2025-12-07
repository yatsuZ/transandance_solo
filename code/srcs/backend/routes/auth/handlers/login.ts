import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo } from '../../../core/db/models/User.js';
import { AuthService } from '../../../core/auth/auth.service.js';
import { TwoFAService } from '../../../core/auth/twofa.service.js';
import { SuccessResponse, ErrorResponse, errorResponseSchema } from '../../types.js';

interface LoginBody {
  username: string;
  password: string;
  twofa_token?: string; // Code 2FA optionnel
}

interface LoginData {
  token: string;
  user: {
    id: number;
    username: string;
    email: string | null;
    avatar_url: string | null;
  };
}

type LoginResponse =
  | SuccessResponse<LoginData>
  | ErrorResponse;

export const loginSchema = {
  description: 'Authentifie un utilisateur et retourne un JWT',
  tags: ['auth'],
  body: {
    type: 'object' as const,
    required: ['username', 'password'],
    properties: {
      username: { type: 'string', minLength: 1, description: 'Nom d\'utilisateur' },
      password: { type: 'string', minLength: 1, description: 'Mot de passe' }
    }
  },
  response: {
    200: {
      description: 'Login réussi',
      type: 'object' as const,
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object' as const,
          properties: {
            token: { type: 'string', description: 'JWT token' },
            user: {
              type: 'object' as const,
              properties: {
                id: { type: 'integer' },
                username: { type: 'string' },
                email: { type: ['string', 'null'] },
                avatar_url: { type: ['string', 'null'] }
              }
            }
          }
        },
        message: { type: 'string' }
      }
    },
    401: { description: 'Identifiants invalides', ...errorResponseSchema }
  }
} as const;

/**
 * Handler: POST /api/auth/login
 * Authentifie un utilisateur et retourne un JWT
 * Supporte le 2FA si activé sur le compte
 *
 * @param body - Identifiants (username, password, twofa_token?)
 * @returns 200 - JWT token et données utilisateur
 * @returns 401 - Identifiants invalides ou code 2FA invalide
 * @returns 403 - Code 2FA requis (requires2FA: true)
 */
export async function login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply): Promise<LoginResponse> {
  const { username, password, twofa_token } = request.body;

  console.log(`\n[Login] 🔐 Tentative de connexion pour: ${username}`);

  // Récupérer l'utilisateur par username
  const user = userRepo.getUserByUsername(username);
  if (!user) {
    console.log('[Login] ❌ User introuvable');
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'Invalid credentials'
    });
  }

  console.log(`[Login] ✅ User trouvé: ${user.username} (ID: ${user.id})`);

  // Vérifier que l'utilisateur n'est pas un compte Google OAuth uniquement
  if (!user.password_hash) {
    console.log('[Login] ❌ Compte Google OAuth - utilisez "Continuer avec Google"');
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'This account uses Google Sign-In. Please use "Continue with Google" button.'
    });
  }

  // Vérifier le mot de passe
  const isPasswordValid = await AuthService.verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    console.log('[Login] ❌ Mot de passe invalide');
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: 'Invalid credentials'
    });
  }

  console.log('[Login] ✅ Mot de passe valide');

  // ========================================
  // VÉRIFICATION 2FA
  // ========================================
  const is2FAEnabled = userRepo.is2FAEnabled(user.id);

  if (is2FAEnabled) {
    // Première requête (sans code 2FA) → demander le code
    if (!twofa_token) {
      return reply.code(StatusCodes.FORBIDDEN).send({
        success: false,
        requires2FA: true,
        message: 'Code 2FA requis'
      });
    }

    // Deuxième requête (avec code 2FA) → vérifier le code
    const secret = userRepo.get2FASecret(user.id);

    if (!secret) {
      return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: 'Erreur 2FA'
      });
    }

    const isValid = TwoFAService.verifyToken(twofa_token, secret);

    if (!isValid) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: 'Code 2FA invalide'
      });
    }
  }

  // ========================================
  // GÉNÉRATION JWT ET CONNEXION
  // ========================================
  console.log('[Login] 🎟️ Génération du JWT');

  // Générer le JWT
  const token = AuthService.generateToken({
    userId: user.id,
    username: user.username
  });

  // Envoyer le JWT dans un cookie HTTP-only sécurisé
  reply.setCookie('auth_token', token, {
    httpOnly: true,  // Pas accessible via JavaScript (sécurité XSS)
    secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en production
    sameSite: 'strict', // Protection CSRF
    path: '/',
    maxAge: 24 * 60 * 60 // 24 heures en secondes
  });

  // Marquer l'utilisateur comme en ligne
  userRepo.setOnline(user.id, true);

  console.log('[Login] ✅ Connexion réussie');

  // Retourner les données utilisateur (sans le token dans le JSON)
  return reply.code(StatusCodes.OK).send({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url
      }
    },
    message: 'Login successful'
  });
}
