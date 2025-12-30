/**
 * Routes 2FA (Two-Factor Authentication)
 * Gestion du setup, activation, désactivation et vérification du 2FA
 */

import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../core/auth/auth.middleware.js';
import { TwoFAService } from '../../core/auth/twofa.service.js';
import { userRepo } from '../../core/db/models/User.js';

export default async function twofaRoutes(fastify: FastifyInstance) {

  // ========================================
  // POST /api/auth/2fa/setup
  // Générer le QR code pour configurer 2FA
  // ========================================
  fastify.post('/setup', {
    preHandler: authMiddleware
  }, async (request, reply) => {
    const userId = request.user!.userId;
    const user = userRepo.getUserById(userId);

    if (!user) {
      return reply.code(404).send({ success: false, error: 'Utilisateur introuvable' });
    }

    // Générer un nouveau secret
    const secret = TwoFAService.generateSecret();

    // Sauvegarder le secret (mais pas encore activé)
    userRepo.set2FASecret(userId, secret);

    // Générer le QR code
    const otpAuthURL = TwoFAService.generateOtpAuthURL(user.username, secret);
    const qrCodeDataURL = await TwoFAService.generateQRCode(otpAuthURL);

    return reply.send({
      success: true,
      data: {
        secret,
        qrCode: qrCodeDataURL
      }
    });
  });

  // ========================================
  // POST /api/auth/2fa/verify
  // Vérifier le code et activer le 2FA
  // ========================================
  fastify.post('/verify', {
    preHandler: authMiddleware
  }, async (request, reply) => {
    const userId = request.user!.userId;
    const { token } = request.body as { token: string };

    if (!token) {
      return reply.code(400).send({ success: false, error: 'Code manquant' });
    }

    const secret = userRepo.get2FASecret(userId);

    if (!secret) {
      return reply.code(400).send({ success: false, error: '2FA pas configuré' });
    }

    // Vérifier le code
    const isValid = TwoFAService.verifyToken(token, secret);

    if (!isValid) {
      return reply.code(401).send({ success: false, error: 'Code invalide' });
    }

    // Activer le 2FA
    userRepo.enable2FA(userId);

    return reply.send({
      success: true,
      message: '2FA activé avec succès'
    });
  });

  // ========================================
  // POST /api/auth/2fa/disable
  // Désactiver le 2FA
  // ========================================
  fastify.post('/disable', {
    preHandler: authMiddleware
  }, async (request, reply) => {
    const userId = request.user!.userId;
    const { token } = request.body as { token: string };

    if (!token) {
      return reply.code(400).send({ success: false, error: 'Code manquant' });
    }

    const secret = userRepo.get2FASecret(userId);

    if (!secret) {
      return reply.code(400).send({ success: false, error: '2FA pas activé' });
    }

    // Vérifier le code avant de désactiver
    const isValid = TwoFAService.verifyToken(token, secret);

    if (!isValid) {
      return reply.code(401).send({ success: false, error: 'Code invalide' });
    }

    // Désactiver le 2FA
    userRepo.disable2FA(userId);

    return reply.send({
      success: true,
      message: '2FA désactivé avec succès'
    });
  });

  // ========================================
  // GET /api/auth/2fa/status
  // Vérifier si 2FA activé
  // ========================================
  fastify.get('/status', {
    preHandler: authMiddleware
  }, async (request, reply) => {
    const userId = request.user!.userId;
    const isEnabled = userRepo.is2FAEnabled(userId);

    return reply.send({
      success: true,
      data: { enabled: isEnabled }
    });
  });
}
