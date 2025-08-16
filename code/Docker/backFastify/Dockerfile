FROM node:20

RUN useradd -m appuser

WORKDIR /app

COPY ./code/srcs/ srcs
COPY ./code/*.json .

# Coriger sa dangeureux donner tout les droits
RUN chown -R appuser:appuser /app/srcs
RUN chmod -R u+rwX /app/srcs

USER appuser

RUN npm install

EXPOSE 3000
