import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo, User } from '../../../core/db/models/User.js';
import { AuthService } from '../../../core/auth/auth.service.js';
import { SuccessResponse, ErrorResponse } from '../../types.js';

type SafeUser = Omit<User, 'password_hash'>;

interface GoogleUserInfo {
  sub: string; // Google ID
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

interface GoogleCallbackQuery {
  code: string;
  state?: string;
}

/**
 * NOTE: GET /api/auth/google est automatiquement gérée par @fastify/oauth2
 * via startRedirectPath: '/api/auth/google' dans main.ts
 * Pas besoin de handler manuel pour la route de démarrage OAuth
 */

/**
 * Handler: GET /api/auth/google/callback
 * Callback après authentification Google
 */
export async function googleCallback(
  request: FastifyRequest<{ Querystring: GoogleCallbackQuery }>,
  reply: FastifyReply
): Promise<void> {
  try {
    console.log('[Google OAuth] 📥 Callback reçu depuis Google');
    console.log('[Google OAuth] 🔍 Query params:', request.query);

    const { code } = request.query;

    if (!code) {
      console.error('[Google OAuth] ❌ Pas de code dans les query params');
      return reply.redirect('/login?error=no_auth_code');
    }

    console.log('[Google OAuth] ✅ Code d\'autorisation reçu');

    // Échanger le code contre un access token (manuellement)
    console.log('[Google OAuth] 🔄 Échange du code contre un access token...');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[Google OAuth] ❌ Erreur lors de l\'échange du code:', errorText);
      return reply.redirect('/login?error=token_exchange_failed');
    }

    const tokenData = await tokenResponse.json() as { access_token: string; token_type: string };
    console.log('[Google OAuth] ✅ Access token récupéré');

    // Récupérer les informations utilisateur depuis Google
    console.log('[Google OAuth] 🔄 Récupération des infos utilisateur Google...');
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    console.log('[Google OAuth] 📡 Response status:', userInfoResponse.status);

    if (!userInfoResponse.ok) {
      console.error('[Google OAuth] ❌ Erreur lors de la récupération des infos user');
      console.error('[Google OAuth] ❌ Response:', await userInfoResponse.text());
      return reply.redirect('/login?error=google_auth_failed');
    }

    const googleUser = await userInfoResponse.json() as GoogleUserInfo;
    console.log('[Google OAuth] ✅ Infos utilisateur récupérées');
    console.log('[Google OAuth] 📧 Email:', googleUser.email);
    console.log('[Google OAuth] 👤 Name:', googleUser.name);
    console.log('[Google OAuth] 🆔 Google ID:', googleUser.sub);

    // Vérifier si l'email est vérifié
    if (!googleUser.email_verified) {
      console.warn('[Google OAuth] ⚠️ Email non vérifié');
      return reply.redirect('/login?error=email_not_verified');
    }

    // Chercher si un compte existe déjà avec cet ID Google
    let user = userRepo.getUserByGoogleId(googleUser.sub);

    if (user) {
      console.log(`[Google OAuth] ✅ Utilisateur existant trouvé: ${user.username}`);
    } else {
      // Chercher si un compte existe avec cet email
      const existingUserByEmail = userRepo.getUserByEmail(googleUser.email);

      if (existingUserByEmail) {
        // Lier le compte existant avec Google
        console.log(`[Google OAuth] 🔗 Liaison du compte existant ${existingUserByEmail.username} avec Google`);
        userRepo.linkGoogleAccount(existingUserByEmail.id, googleUser.sub);
        user = userRepo.getUserById(existingUserByEmail.id);
      } else {
        // PAS de compte trouvé - rediriger vers la page de signup
        console.log('[Google OAuth] ❌ Aucun compte trouvé - redirection vers signup');
        return reply.redirect('/signup?error=no_account&email=' + encodeURIComponent(googleUser.email));
      }
    }

    if (!user) {
      console.error('[Google OAuth] ❌ Impossible de créer/récupérer l\'utilisateur');
      return reply.redirect('/login?error=user_creation_failed');
    }

    // Générer le JWT
    const jwtToken = AuthService.generateToken({
      userId: user.id,
      username: user.username
    });

    // Envoyer le JWT dans un cookie HTTP-only sécurisé
    reply.setCookie('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 // 24 heures en secondes
    });

    // Marquer l'utilisateur comme en ligne
    userRepo.setOnline(user.id, true);

    console.log(`[Google OAuth] 🎉 Connexion réussie pour ${user.username}`);

    // Rediriger vers la page d'accueil
    return reply.redirect('/');
  } catch (error) {
    console.error('[Google OAuth] ❌ ERREUR COMPLÈTE:');
    console.error('[Google OAuth] ❌ Type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Google OAuth] ❌ Message:', error instanceof Error ? error.message : String(error));
    console.error('[Google OAuth] ❌ Stack:', error instanceof Error ? error.stack : 'No stack trace');
    return reply.redirect('/login?error=google_auth_error');
  }
}
