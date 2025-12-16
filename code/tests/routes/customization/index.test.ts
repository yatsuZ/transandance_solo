import { describe } from '@jest/globals';
import { buildFastify } from '../../../srcs/backend/config/fastify.js';
import { FastifyInstance } from 'fastify';
import { testCustomization } from './customization.test.js';

describe('Customization Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildFastify();
  });

  afterAll(async () => {
    await app.close();
  });

  const getApp = () => app;

  // Tests Customization
  testCustomization(getApp);
});
