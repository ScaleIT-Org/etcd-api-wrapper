"use strict";
/*******************************************************************
 *   accessControlChecker.js
 *******************************************************************/
const cors = require('./accessControlChecker.json');

function accessControlChecker(req, res, next) {
     let reqUrl = req.get('origin') ? req.get('origin') : req.protocol + '://' + req.get('host');
     let reqIp = req.get('host');
     if (reqIp.indexOf(":") >= 0) reqIp = reqIp.split(":")[0];
     if (reqIp === process.env.HOST_IP || (isLocalhost(reqIp) && isLocalhost(process.env.HOST_IP || "localhost"))) {
          next();
     } else if (cors.allowAll || cors.allowedDomains.indexOf(req.get('host')) > -1) {
          res.header('Access-Control-Allow-Origin', reqUrl);
          res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,HEAD,PUT,POST,DELETE');
          res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers,Origin,Accept,X-Requested-With,Content-Type,Access-Control-Request-Method,Access-Control-Request-Headers,Authorization');
          next();
     } else {
          res.sendStatus(403);
     }
}

module.exports = accessControlChecker;

function isLocalhost(ip) {
     return ip === "localhost" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1";
}