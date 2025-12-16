import { FastifyInstance } from 'fastify';
import { buildFastify } from '../../../srcs/backend/config/fastify.js';
import { testCreateMatch } from './create-match.test.js';
import { testGetAllMatches } from './get-all-matches.test.js';
import { testGetMatchById } from './get-match-by-id.test.js';
import { testUpdateScore } from './update-score.test.js';
import { testEndMatch } from './end-match.test.js';
import { testDeleteMatch } from './delete-match.test.js';
import { testGetMatchesByStatus } from './get-matches-by-status.test.js';

describe('Routes /api/matches', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildFastify();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // Appeler tous les tests au niveau du describe (pas dans beforeAll)
  testCreateMatch(() => app);
  testGetAllMatches(() => app);
  testGetMatchById(() => app);
  testUpdateScore(() => app);
  testEndMatch(() => app);
  testDeleteMatch(() => app);
  testGetMatchesByStatus(() => app);
});
