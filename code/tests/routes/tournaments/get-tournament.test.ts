import { FastifyInstance } from 'fastify';

interface SignupResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: number;
      username: string;
      email: string | null;
    };
  };
  error?: string;
}

interface TournamentResponse {
  success: boolean;
  data?: {
    id: number;
    manager_id: number;
    winner_participant_id: number | null;
    nbr_of_matches: number;
    matches_remaining: number;
    status: string;
    created_at: string;
    end_at: string | null;
  };
  error?: string;
}

export function testGetTournament(getApp: () => FastifyInstance) {
  describe('GET /api/tournaments/:id - Get Tournament by ID', () => {
    it('devrait récupérer un tournoi par son ID', async () => {
      const app = getApp();
      const signupResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'get_manager',
          email: 'get@example.com',
          password: 'password123'
        }
      });

      const signup: SignupResponse = JSON.parse(signupResponse.body);
      const managerId = signup.data!.user.id;

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/tournaments',
        payload: {
          manager_id: managerId
        }
      });

      const created: TournamentResponse = JSON.parse(createResponse.body);
      const tournamentId = created.data!.id;

      const response = await app.inject({
        method: 'GET',
        url: `/api/tournaments/${tournamentId}`
      });

      expect(response.statusCode).toBe(200);
      const data: TournamentResponse = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data!.id).toBe(tournamentId);
    });

    it('devrait retourner 404 si le tournoi n\'existe pas', async () => {
      const app = getApp();

      const response = await app.inject({
        method: 'GET',
        url: '/api/tournaments/99999'
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/tournaments - Get All Tournaments', () => {
    it('devrait récupérer tous les tournois', async () => {
      const app = getApp();

      // Créer un manager
      const signupResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          username: 'list_manager',
          email: 'list@example.com',
          password: 'password123'
        }
      });

      const signup: SignupResponse = JSON.parse(signupResponse.body);
      const managerId = signup.data!.user.id;

      // Créer plusieurs tournois
      const create1 = await app.inject({
        method: 'POST',
        url: '/api/tournaments',
        payload: { manager_id: managerId }
      });
      expect(create1.statusCode).toBe(201);

      const create2 = await app.inject({
        method: 'POST',
        url: '/api/tournaments',
        payload: { manager_id: managerId }
      });
      expect(create2.statusCode).toBe(201);

      // Récupérer tous les tournois
      const response = await app.inject({
        method: 'GET',
        url: '/api/tournaments'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThanOrEqual(2);
    });
  });
}
