'use strict';

global.__basedir = __dirname;
const SwaggerExpress = require('swagger-express-mw');
const SwaggerUi = require('swagger-tools/middleware/swagger-ui');
const express = require('express');
const fs = require('fs');
const {promisify} = require('util');
const path = require('path');
const http = require('http');
const https = require('https');
const helper = require('node-helper');
const morgan = require('morgan');
const accessControlChecker = helper.middleware.accessControlChecker;
let logger = helper.logger("app.js");
let app = require('express')();
module.exports = app; // for testing

let protocol = process.env.SERVER_PROTOCOL || "https";
let ip = process.env.HOST_IP || "localhost";
let port = process.env.SERVER_PORT || 49503;
let key = process.env.SSL_KEY || "config/server.key";
let cert = process.env.SSL_CERT || "config/server.crt";

let mongooseConfig = {
     useMongoClient: true
};

let swaggerConfig = {
     appRoot: __dirname // required config
};

async function initialize() {
     try {
        const Etcd = require('node-etcd');
        var etcd = new Etcd("127.0.0.1:49501");

        app.use(morgan(':method :url - :status', {stream: logger.stream}));
        app.use(accessControlChecker);
        // serve /api directory that swagger editor supports multiple files
        app.use('/api', express.static(path.join(__dirname, 'api')));
        let swaggerExpress = await promisify(SwaggerExpress.create)(swaggerConfig);
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
        logger.info('Server listening at %s://%s:%s', protocol, ip, port);
        logger.info('Hit CTRL-C to stop the server');
        app.use(SwaggerUi(swaggerExpress.runner.swagger));
        logger.info('Swagger Documentation available at %s://%s:%s/docs', protocol, ip, port);
        logger.info('Swagger API-Documentation available at %s://%s:%s/api-docs', protocol, ip, port);
     } catch (error) {
          logger.error(error.message);
          logger.silly(error);
          //shutdown();
     }
}

initialize();

process.on('uncaughtException', function (error) {
     logger.error(error.message);
     logger.silly(error)
});

process.stdin.resume();
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
     logger.info("Shutting down...");
     process.exit();
}