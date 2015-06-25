#!/bin/sh

mkdir -p /etc/ssl
cd /etc/ssl

echo "Generating signing SSL private key"
openssl genrsa -des3 -passout pass:x -out key.pem 2048

echo "Removing passphrase from private key"
cp key.pem key.pem.orig
openssl rsa -passin pass:x -in key.pem.orig -out key.pem

echo "Generating certificate signing request"
openssl req -new -key key.pem -out cert.csr -subj "/C=GB/ST=GB/L=London/O=OPG/OU=Digital/CN=sensu"

echo "Generating self-signed certificate"
openssl x509 -req -days 3650 -in cert.csr -signkey key.pem -out cert.pem

