FROM node:20

WORKDIR /app

COPY ./srcs/backend backend
COPY ./srcs/static static
COPY ./Docker/backFastify/conf/  .

RUN useradd -m appuser

RUN chown -R appuser:appuser /app
RUN chown -R appuser:appuser ./

USER appuser

RUN npm install

EXPOSE 3000