FROM alpine:3.19

ARG SERVER_NAME

RUN apk update && apk upgrade
RUN apk add nginx openssl bash curl envsubst

RUN mkdir -p /etc/nginx/ssl
RUN mkdir -p /var/run/nginx
RUN mkdir -p /var/www/html

RUN chmod 755 /var/www/html

COPY ./tools/generateur_certifica.sh /root/generateur_certifica.sh
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./tools/start_server.sh /root/start_server.sh

RUN chmod +x /root/generateur_certifica.sh
RUN chmod +x /root/start_server.sh

RUN /root/generateur_certifica.sh

EXPOSE 443

ENTRYPOINT ["/root/start_server.sh"]
