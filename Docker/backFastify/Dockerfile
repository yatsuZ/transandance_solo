FROM node:20

WORKDIR /app

COPY ./code/srcs/ srcs
COPY ./code/*.json .

# USER root

RUN npm install

EXPOSE 3000
