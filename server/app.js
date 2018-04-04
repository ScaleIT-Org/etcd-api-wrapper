'use strict';

global.__basedir = __dirname;
const Runner = require('swagger-node-runner');
const SwaggerUi = require('swagger-tools/middleware/swagger-ui');
const express = require('express');
const fs = require('fs');
const {promisify} = require('util');
const path = require('path');
const http = require('http');
const https = require('https');
const morgan = require('morgan');
const cors = require('cors');
let app = require('express')();
module.exports = app; // for testing

let protocol = process.env.SERVER_PROTOCOL || "http";
let ip = process.env.HOST_IP || "localhost";
let port = process.env.SERVER_PORT || 49503;
let key = process.env.SSL_KEY || "config/server.key";
let cert = process.env.SSL_CERT || "config/server.crt";
let etcdAdress = process.env.ETCD_ADDRESS || "localhost:49501";

let swaggerConfig = {
     appRoot: __dirname // required config
};

async function initialize() {
     try {
        app.use(morgan(':method :url - :status'));
        app.use(cors());
        // serve /api directory that swagger editor supports multiple files
        app.use('/api', express.static(path.join(__dirname, 'api')));
        let runner = await promisify(Runner.create)(swaggerConfig);
        let swaggerExpress = runner.expressMiddleware();
        swaggerExpress.register(app);
        let server;
        if (protocol === 'https') {
            let options = {
                 key: fs.readFileSync(key),
                 cert: fs.readFileSync(cert),
                 rejectUnauthorized: false
            };
            server = https.createServer(options, app);
       } else {
            server = http.createServer(app);
       }
        await server.listen(port);
        console.log('Server listening at %s://%s:%s', protocol, ip, port);
        console.log('Hit CTRL-C to stop the server');
        app.use(SwaggerUi(swaggerExpress.runner.swagger));
        console.log('Swagger Documentation available at %s://%s:%s/docs', protocol, ip, port);
        console.log('Swagger API-Documentation available at %s://%s:%s/api-docs', protocol, ip, port);
     } catch (error) {
          console.log(error.message);
          shutdown();
     }
}

initialize();

process.on('uncaughtException', function (error) {
     console.log(error.message);
});

process.stdin.resume();
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
     console.log("Shutting down...");
     process.exit();
}