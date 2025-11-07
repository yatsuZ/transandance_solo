FROM node:20-alpine

WORKDIR /app

COPY ./code/srcs/ srcs
COPY ./code/*.json .

RUN apk add --no-cache tree

RUN npm install typescript

RUN npm install

EXPOSE 3000
