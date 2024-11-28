# Certificado SSL local

Para gerar um certificado ssl auto-assinado, leia: https://stackoverflow.com/questions/10175812/how-to-generate-a-self-signed-ssl-certificate-using-openssl

```sh
# https://stackoverflow.com/questions/10175812/how-to-generate-a-self-signed-ssl-certificate-using-openssl
# Add -nodes (short for "no DES") if you don't want to protect your private key with a passphrase
# Add -subj '/CN=localhost' to suppress questions about the contents of the certificate
openssl req -x509 -newkey rsa:4096 \
    -keyout key.pem \
    -out cert.pem \
    -sha256 -days 365 \
    -nodes \
    -subj '/CN=localhost'
```
