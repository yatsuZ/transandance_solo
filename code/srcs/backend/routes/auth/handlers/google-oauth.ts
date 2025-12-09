import { FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { userRepo, User } from '../../../core/db/models/User.js';
import { AuthService } from '../../../core/auth/auth.service.js';
import { SuccessResponse, ErrorResponse } from '../../types.js';

type SafeUser = Omit<User, 'password_hash'>;

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

interface GoogleCallbackQuery {
  code: string;
  state?: string;
}

export async function googleCallback(
  request: FastifyRequest<{ Querystring: GoogleCallbackQuery }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { code } = request.query;

    if (!code) {
      return reply.redirect('/login?error=no_auth_code');
    }

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
      return reply.redirect('/login?error=token_exchange_failed');
    }

    const tokenData = await tokenResponse.json() as { access_token: string; token_type: string };

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    if (!userInfoResponse.ok) {
      return reply.redirect('/login?error=google_auth_failed');
    }

    const googleUser = await userInfoResponse.json() as GoogleUserInfo;

    if (!googleUser.email_verified) {
      return reply.redirect('/login?error=email_not_verified');
    }

    let user = userRepo.getUserByGoogleId(googleUser.sub);

    if (user) {
    } else {
      const existingUserByEmail = userRepo.getUserByEmail(googleUser.email);

      if (existingUserByEmail) {
        userRepo.linkGoogleAccount(existingUserByEmail.id, googleUser.sub);
        user = userRepo.getUserById(existingUserByEmail.id);
      } else {
        return reply.redirect('/signup?error=no_account&email=' + encodeURIComponent(googleUser.email));
      }
    }

    if (!user) {
      return reply.redirect('/login?error=user_creation_failed');
    }

    const jwtToken = AuthService.generateToken({
      userId: user.id,
      username: user.username
    });

    reply.setCookie('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60
    });

    userRepo.setOnline(user.id, true);

    return reply.redirect('/');
  } catch (error) {
    return reply.redirect('/login?error=google_auth_error');
  }
}
