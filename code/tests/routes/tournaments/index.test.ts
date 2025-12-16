import { buildFastify } from '../../../srcs/backend/config/fastify.js';
import { FastifyInstance } from 'fastify';
import { testCreateTournament } from './create-tournament.test.js';
import { testGetTournament } from './get-tournament.test.js';
import { testAddParticipant } from './add-participant.test.js';
import { testEndTournament } from './end-tournament.test.js';
import { testDeleteTournament } from './delete-tournament.test.js';

describe('Tournament Routes', () => {
  let app: FastifyInstance;

  const getApp = () => app;

  beforeAll(async () => {
    app = await buildFastify();
  });

  afterAll(async () => {
    await app.close();
  });

  testCreateTournament(getApp);
  testGetTournament(getApp);
  testAddParticipant(getApp);
  testEndTournament(getApp);
  testDeleteTournament(getApp);
});
