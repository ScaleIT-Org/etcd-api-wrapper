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
const mongoose = require('mongoose');
const mongooseHelper = helper.mongoose;
const morgan = require('morgan');
const accessControlChecker = helper.middleware.accessControlChecker;
let logger = helper.logger("app.js");
let app = require('express')();
module.exports = app; // for testing

let protocol = process.env.SERVER_PROTOCOL || "https";
let ip = process.env.HOST_IP || "localhost";
let port = process.env.SERVER_PORT || 49501;
let key = process.env.SSL_KEY || "config/server.key";
let cert = process.env.SSL_CERT || "config/server.crt";
let mongodbAddress = process.env.MONGODB_ADDRESS || "localhost:27017";
let mongodbDB = process.env.MONGODB_DB || "app-registry";
let mongodbUser = process.env.MONGODB_USER || "";
let mongodbPassword = process.env.MONGODB_PASSWORD || "";

let mongooseConfig = {
     useMongoClient: true
};

let swaggerConfig = {
     appRoot: __dirname // required config
};

async function initialize() {
     try {
          mongoose.Promise = require('bluebird');
          if (mongodbUser && mongodbPassword) {
               mongodbAddress = mongodbUser + ":" + mongodbPassword + "@" + mongodbAddress;
          }
          let mongodbUrl = "mongodb://" + mongodbAddress + "/" + mongodbDB;
          await mongoose.connect(mongodbUrl, mongooseConfig);
          logger.info("Mongoose connected to database " + mongodbUrl + "...");
          mongooseHelper.registerSchemas(path.join(__dirname, "/api/definitions/schemas"), true, "kind");
          app.use(morgan(':method :url - :status', {stream: logger.stream}));
          app.use('/api', accessControlChecker, express.static(path.join(__dirname, 'api')));
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
          // serve /api directory that swagger editor supports multiple files
          app.use(SwaggerUi(swaggerExpress.runner.swagger));
          logger.info('Swagger Documentation available at %s://%s:%s/docs', protocol, ip, port);
          logger.info('Swagger API-Documentation available at %s://%s:%s/api-docs', protocol, ip, port);
     } catch (error) {
          logger.error(error.message);
          logger.silly(error);
          shutdown();
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
     if (mongoose.connection) {
          mongoose.connection.close();
     }
     process.exit();
}