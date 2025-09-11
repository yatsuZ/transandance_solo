FROM node:20

WORKDIR /app

COPY ./code/srcs/ srcs
COPY ./code/*.json .

# USER root

RUN apt-get update

RUN apt-get install -y tree

RUN npm install

EXPOSE 3000
