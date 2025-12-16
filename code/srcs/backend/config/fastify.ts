import Fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import fastifyMultipart from '@fastify/multipart';
import fastifyCookie from '@fastify/cookie';
import ejs from 'ejs';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';
import { showLog, parseFileSize } from '../core/utils/utils.js';
import {setupAllRoutesApi} from './../routes/AllIndex.js';

// Fichier qui configure fastify
// Framework qui permet de faire un serveur web 
// On ciffugre sont comportement pour les route, les logs et dautre truc comme ...

const MAX_FILE_SIZE = parseFileSize(process.env.MAX_FILE_SIZE);

export async function buildFastify(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: showLog(),
  });

  const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  await fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'ATTENTion_YaSssine8JEdoisDefinirDansLesVariebleDenvirnementCArklacVisibleToutLemondeVoiiiitEtCpasBienPOurlasecu',
    parseOptions: {}
  });

  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: MAX_FILE_SIZE,
    }
  });

  await fastify.register(fastifyView, {
    engine: { ejs },
    root: path.join(__dirname, './../../../static/views'),
  });

  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, './../../../static'),
    prefix: '/static/',
  });

  await fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
    decorateReply: false
  });

  // Set les routes API par famille
  await setupAllRoutesApi(fastify);

  fastify.setNotFoundHandler(async (request, reply) => {

    if (request.url.startsWith('/static/'))
      return reply.code(404).send({ error: 'File not found' });
    if (request.url.startsWith('/api/'))
      return reply.code(404).send({ success: false, error: 'API endpoint not found' });

    return reply.view('main.ejs');
  });

  fastify.get('/', async (request, reply) => {
    return reply.view('main.ejs');
  });

  return fastify;
}

