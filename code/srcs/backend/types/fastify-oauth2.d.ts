import '@fastify/oauth2';

declare module 'fastify' {
  interface FastifyInstance {
    googleOAuth2: {
      getAccessTokenFromAuthorizationCodeFlow: (request: FastifyRequest) => Promise<{
        access_token: string;
        refresh_token?: string;
        token_type: string;
        expires_in: number;
      }>;
    };
  }

  interface FastifyRequest {
    googleOAuth2: {
      getAccessTokenFromAuthorizationCodeFlow: (request: FastifyRequest) => Promise<{
        access_token: string;
        refresh_token?: string;
        token_type: string;
        expires_in: number;
      }>;
    };
  }

  interface FastifyReply {
    from(name: string): void;
  }
}
