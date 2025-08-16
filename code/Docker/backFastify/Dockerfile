FROM node:20

RUN useradd -m appuser

WORKDIR /app

COPY ./code/srcs/ srcs
COPY ./code/*.json .

# Donne les droits à appuser sur tout /app (et pas seulement /app/srcs)
RUN chown -R appuser:appuser /app

USER appuser

RUN npm install

EXPOSE 3000
