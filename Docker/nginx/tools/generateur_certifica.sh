#!/bin/bash

ROUGE="\e[31m"
NOCOLOR="\e[0m"

if ! command -v openssl &> /dev/null
then
    echo -e $ROUGE "Erreur : 'openssl' n'est pas installé. Veuillez l'installer pour continuer." $NOCOLOR
    exit 1
fi

CERT_PATH="/etc/nginx/ssl/nginx_tls_tr_solo.crt"
KEY_PATH="/etc/nginx/ssl/nginx_tls_tr_solo.key"
SUBJECT="/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=localhost/UID=yzaoui"

openssl req -x509 -nodes -out $CERT_PATH -keyout $KEY_PATH -subj "$SUBJECT"
