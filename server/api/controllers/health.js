'use strict';

module.exports = {
     getHealthStatus: getHealthStatus
};

function getHealthStatus(req, res) {
     let result = {health: "true"};
     res.status(200).json(result);
}
