import { describe } from '@jest/globals';
import { buildApp } from '../../../srcs/backend/main.js';
import { FastifyInstance } from 'fastify';
import { testCustomization } from './customization.test.js';

describe('Customization Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const getApp = () => app;

  // Tests Customization
  testCustomization(getApp);
});
