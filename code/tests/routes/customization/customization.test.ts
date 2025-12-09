import { FastifyInstance } from 'fastify';
import { getAuthToken } from '../../helpers/auth.js';

interface CustomizationResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export function testCustomization(getApp: () => FastifyInstance) {
  let authToken: string;

  beforeAll(async () => {
    authToken = await getAuthToken(getApp());
  });

  describe('GET /api/customization/:game_type - Get Customization', () => {
    it('devrait retourner valeurs par défaut si pas de config (Pong)', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'GET',
        url: '/api/customization/pong',
        cookies: { auth_token: authToken }
      });

      expect(response.statusCode).toBe(200);
      const data: CustomizationResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        paddle_color_left: null,
        paddle_color_right: null,
        ball_color: null,
        field_color: null,
        text_color: null,
        winning_score: null,
        powerups_enabled: false,
        countdown_delay: 3
      });
    });

    it('devrait retourner valeurs par défaut si pas de config (Tron)', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'GET',
        url: '/api/customization/tron',
        cookies: { auth_token: authToken }
      });

      expect(response.statusCode).toBe(200);
      const data: CustomizationResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.vehicle_color_left).toBeNull();
      expect(data.data.vehicle_color_right).toBeNull();
      expect(data.data.trail_color_left).toBeNull();
      expect(data.data.trail_color_right).toBeNull();
    });

    it('devrait retourner 401 si non authentifié', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'GET',
        url: '/api/customization/pong'
      });

      expect(response.statusCode).toBe(401);
      const data: CustomizationResponse = JSON.parse(response.body);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/customization/:game_type - Update Customization', () => {
    it('devrait créer une config Pong', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'PUT',
        url: '/api/customization/pong',
        cookies: { auth_token: authToken },
        payload: {
          paddle_color_left: '#FF0000',
          paddle_color_right: '#00FF00',
          ball_color: '#0000FF',
          field_color: '#000000',
          text_color: '#FFFFFF',
          winning_score: 11,
          powerups_enabled: true,
          countdown_delay: 5
        }
      });

      expect(response.statusCode).toBe(200);
      const data: CustomizationResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.message).toContain('sauvegardée');
      expect(data.data).toMatchObject({
        paddle_color_left: '#FF0000',
        paddle_color_right: '#00FF00',
        ball_color: '#0000FF',
        winning_score: 11,
        powerups_enabled: true,
        countdown_delay: 5
      });
    });

    it('devrait créer une config Tron', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'PUT',
        url: '/api/customization/tron',
        cookies: { auth_token: authToken },
        payload: {
          vehicle_color_left: '#FFFF00',
          vehicle_color_right: '#FF00FF',
          trail_color_left: '#00FFFF',
          trail_color_right: '#FF8800',
          powerups_enabled: false,
          winning_score: 7
        }
      });

      expect(response.statusCode).toBe(200);
      const data: CustomizationResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.vehicle_color_left).toBe('#FFFF00');
      expect(data.data.trail_color_right).toBe('#FF8800');
      expect(data.data.winning_score).toBe(7);
    });

    it('devrait mettre à jour une config existante (partiel)', async () => {
      const app = getApp();
      // Créer d'abord
      await app.inject({
        method: 'PUT',
        url: '/api/customization/pong',
        cookies: { auth_token: authToken },
        payload: {
          ball_color: '#123456'
        }
      });

      // Mettre à jour partiellement
      const response = await app.inject({
        method: 'PUT',
        url: '/api/customization/pong',
        cookies: { auth_token: authToken },
        payload: {
          winning_score: 15
        }
      });

      expect(response.statusCode).toBe(200);
      const data: CustomizationResponse = JSON.parse(response.body);
      expect(data.data.ball_color).toBe('#123456'); // Doit rester
      expect(data.data.winning_score).toBe(15); // Mis à jour
    });

    it('devrait rejeter couleurs invalides', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'PUT',
        url: '/api/customization/pong',
        cookies: { auth_token: authToken },
        payload: {
          ball_color: 'rouge' // Format invalide
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('devrait rejeter si non authentifié', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'PUT',
        url: '/api/customization/pong',
        payload: {
          ball_color: '#FF0000'
        }
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/customization/:game_type - Delete Customization', () => {
    beforeEach(async () => {
      // Créer une config avant chaque test de suppression
      const app = getApp();
      await app.inject({
        method: 'PUT',
        url: '/api/customization/pong',
        cookies: { auth_token: authToken },
        payload: {
          ball_color: '#FF0000'
        }
      });
    });

    it('devrait supprimer une config existante', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/customization/pong',
        cookies: { auth_token: authToken }
      });

      expect(response.statusCode).toBe(200);
      const data: CustomizationResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.message).toContain('supprimée');

      // Vérifier que la config a bien été supprimée
      const getResponse = await app.inject({
        method: 'GET',
        url: '/api/customization/pong',
        cookies: { auth_token: authToken }
      });

      const getData: CustomizationResponse = JSON.parse(getResponse.body);
      expect(getData.data.ball_color).toBeNull(); // Retour aux valeurs par défaut
    });

    it('devrait retourner 404 si aucune config à supprimer', async () => {
      const app = getApp();
      // Supprimer d'abord
      await app.inject({
        method: 'DELETE',
        url: '/api/customization/tron',
        cookies: { auth_token: authToken }
      });

      // Essayer de supprimer à nouveau
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/customization/tron',
        cookies: { auth_token: authToken }
      });

      expect(response.statusCode).toBe(404);
    });

    it('devrait rejeter si non authentifié', async () => {
      const app = getApp();
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/customization/pong'
      });

      expect(response.statusCode).toBe(401);
    });
  });
}
