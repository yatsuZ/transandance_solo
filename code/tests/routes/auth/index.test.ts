import { FastifyInstance } from 'fastify';
import { buildFastify } from '../../../srcs/backend/config/fastify.js';
import { testSignup } from './signup.test.js';
import { testLogin } from './login.test.js';
import { testLogout } from './logout.test.js';
import { testProtectedRoutes } from './protected-routes.test.js';

describe('Routes /api/auth', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildFastify();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // Appeler tous les tests au niveau du describe
  testSignup(() => app);
  testLogin(() => app);
  testLogout(() => app);
  testProtectedRoutes(() => app);
});
