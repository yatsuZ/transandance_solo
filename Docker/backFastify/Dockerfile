FROM node:20-alpine

# NOTE: En mode développement, on reste en root pour éviter les conflits de permissions
# avec les bind mounts. Pour la production, utiliser un utilisateur non-root.

WORKDIR /app

COPY ./code/srcs/ srcs
COPY ./code/*.json .

RUN apk add --no-cache tree curl

RUN npm install typescript

RUN npm install

EXPOSE 3000
