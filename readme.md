# App Registry MongoDB

Dummy implementation of the ERP-proxy for the ScaleIT Platform.

## Run App

General prerequisites:
1. Install Git (https://git-scm.com/)
2. Install Docker (https://www.docker.com/products/docker)
3. Install docker-compose if you are working on a linux system (https://docs.docker.com/compose/install/#install-compose-on-linux-systems)

**IF you are using SSH**

Generate certificate and key:

1. openssl genrsa -des3 -out server.enc.key 1024
2. openssl req -new -key server.enc.key -out server.csr
3. openssl rsa -in server.enc.key -out server.key
4. openssl x509 -req -days 365 -in server.csr -signkey ser

You can choose between different modes to run the app:

### Docker Compose

Just run following commands in the main directory: 

        docker-compose build
        docker-compose up

### Rancher (Preferred)

Prerequisites:
* Install and configure Rancher
* Add Git repository for catalog entries to Rancher catalogs
* Create a docker registry
* Add docker registry to Rancher
* Install Registry with the help of the Rancher catalog

**IF you are using SSH**

* Install official app "Rancher Secrets"
* In Rancher: go to Infrastructure > Secrets and add certificate with name sslcert and key with name sslkey

Go to directory ./erp-proxy-dummy/docker and create an .env file:

        REGISTRY_ADDRESS=<your-registry-address>

Build the project and push it to the registry:

        docker-compose build
        docker-compose push

Start Rancher Admin Panel, got to Catalog and select the app. Fill in the questions:

        REGISTRY_ADDRESS
        HOST_IP
        EXPOSED_SERVER_PORT
        ETCD_ADDRESS

### Local

Prerequisites
* Install node.js and npm (https://nodejs.org/en/)

**IF you are using SSH**

* place ssh certificate with name server.crt and key with name server.key in directory ./erp-proxy-dummy/server/config

Go to directory ./erp-proxy-dummy/server and run:

        node app.js