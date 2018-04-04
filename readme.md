# App Registry ETCD

Simple wrapper application for the ScaleIT-App API with ETCD

## Run App

General prerequisites:
1. Install Git (https://git-scm.com/)
2. Install Docker (https://www.docker.com/products/docker)
3. Install docker-compose if you are working on a linux system (https://docs.docker.com/compose/install/#install-compose-on-linux-systems)

### Docker Compose

Just run following commands in the main directory:

        docker-compose build
        docker-compose up

### Standalone

To use the application without docker just go into the folder "server":

      cd server

and execute:

      node app.js

### HTTPS

If you want to use the server with https you need to generate a certificate:

      Generate certificate and key:

      1. openssl genrsa -des3 -out server.enc.key 1024
      2. openssl req -new -key server.enc.key -out server.csr
      3. openssl rsa -in server.enc.key -out server.key
      4. openssl x509 -req -days 365 -in server.csr -signkey ser

and change the protocol the docker-compose file or directly in app.js
