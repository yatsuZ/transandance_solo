import { FastifyInstance } from 'fastify';
import { signup, signupSchema } from './handlers/signup.js';
import { login, loginSchema } from './handlers/login.js';

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /api/auth/signup - Créer un compte
  fastify.post('/signup', { schema: signupSchema }, signup);

  // POST /api/auth/login - Se connecter
  fastify.post('/login', { schema: loginSchema }, login);
}
