FROM node:20

WORKDIR /app

COPY ./code/srcs/backend backend
COPY ./code/srcs/static static
COPY ./code/*.json  .

RUN useradd -m appuser

RUN chown -R appuser:appuser /app
RUN chown -R appuser:appuser ./

USER appuser

RUN npm install

EXPOSE 3000