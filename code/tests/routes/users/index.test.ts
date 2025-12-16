import { FastifyInstance } from 'fastify';
import { buildFastify } from '../../../srcs/backend/config/fastify.js';
import { testCreateUser } from './create-user.test.js';
import { testGetAllUsers } from './get-all-users.test.js';
import { testGetUserById } from './get-user-by-id.test.js';
import { testUpdateUser } from './update-user.test.js';
import { testDeleteUser } from './delete-user.test.js';

describe('Routes /api/users', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildFastify();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // Appeler tous les tests au niveau du describe (pas dans beforeAll)
  testCreateUser(() => app);
  testGetAllUsers(() => app);
  testGetUserById(() => app);
  testUpdateUser(() => app);
  testDeleteUser(() => app);
});
