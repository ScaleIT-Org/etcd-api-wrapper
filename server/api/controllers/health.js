'use strict';

const etcdAdress = process.env.ETCD_ADDRESS || "localhost:49501";
const Etcd = require('node-etcd');
const etcd = new Etcd(etcdAdress);

module.exports = {
     getHealthStatus: getHealthStatus
};

function getHealthStatus(req, res) {
    etcd.raw("GET", "health", null, { maxRetries: 2, timeout: 1000, }, test.bind(null, res));
}

function test(res, err, msg) {
    if (err) {
        let result = {};
        result.error = Object.assign({}, err);
        result.error.message = err.message;
        res.status(500).json(result);
    } else{
        res.status(200).json({health: "true"});
    }
}