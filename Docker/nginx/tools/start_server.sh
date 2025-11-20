#!/bin/sh

# Remplace les variables d'environnement dans nginx.conf
envsubst '${SERVER_NAME} ${FASTIFY_PORT}' < /etc/nginx/nginx.conf > /etc/nginx/nginx_TMP.conf
mv /etc/nginx/nginx_TMP.conf /etc/nginx/nginx.conf

# Lancer Nginx avec la commande "daemon off" pour qu'il fonctionne en premier plan
exec nginx -g "daemon off;"
