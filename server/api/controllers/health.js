'use strict';

const Etcd = require('node-etcd');
var etcd = new Etcd("127.0.0.1:49501");
module.exports = {
     getHealthStatus: getHealthStatus
};
function getHealthStatus(req, res) {
    etcd.raw("GET", "health", null, { maxRetries: 2, timeout: 1000, }, test.bind(null, res));
}

function test(res, err, msg) {
    if (err) {
        res.status(200).json('"{"error": { "message": "' + err +'"} }"');
    } else{
        res.status(200).json(msg);
    }
}