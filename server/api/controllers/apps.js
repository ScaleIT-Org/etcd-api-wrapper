'use strict';

const etcdAdress = process.env.ETCD_ADDRESS || "localhost:49501";
const Etcd = require('node-etcd');
const etcd = new Etcd(etcdAdress);

module.exports = {
     getApps: getApps,
     getApp: getApp,
     createApp: createApp,
     updateApp: updateApp,
     deleteApp: deleteApp,
     getSchema: getSchema
};

function errorHandler(error, req, res) {
     let result = {};
     result.error = Object.assign({}, error);
     result.error.message = error.message;
     res.status(500).json(result);
}

function getApps(req, res) {
     (async () => {
          try {
               let lang = req.swagger.params["Accept-Language"].value || 'de';
               let appType = req.swagger.params.appType.value || undefined;
               etcd.get("", {recursive: true}, function (res, err, msg) {
                    let etcdapps = msg.node.nodes;
                    let typeBool = true;
                    let apps = [];
                    for (let directory of etcdapps) {
                         let appsEntry = {};
                         for (let info of directory.nodes[0].nodes) {
                              let key = info.key.split("/")[3];
                              if (appType && (key === "appType" && info.value !== appType)) {
                                   typeBool = false;
                              }
                              appsEntry[key] = info.value
                         }
                         if (typeBool === true) {
                              apps.push(appsEntry);
                         }
                         typeBool = false;
                    }
                    let total = apps.length;
                    let result = {
                         appType: appType,
                         lang: lang,
                         total: total,
                         apps: apps
                    };
                    res.status(200).json(result);
               }.bind(null, res));

          } catch (error) {
               errorHandler(error, req, res);
          }
     })();
}

function getApp(req, res) {
     (async () => {
          try {
               let id = decodeURIComponent(req.swagger.params.id.value);
               etcd.get("", {recursive: true}, function (res, err, msg) {
                    let etcdapps = msg.node.nodes;
                    let typeBool = false;
                    let answer = {};
                    for (let directory of etcdapps) {
                         let appsEntry = {};
                         for (let info of directory.nodes[0].nodes) {
                              let key = info.key.split("/")[3];
                              if (id && (key === "id" && info.value === id)) {
                                   typeBool = true;
                              }
                              appsEntry[key] = info.value
                         }
                         if (typeBool === true) {
                              answer = appsEntry;
                         }
                         typeBool = false;
                    }
                    res.status(200).json(answer);
               }.bind(null, res));
          } catch (error) {
               errorHandler(error, req, res);
          }
     })();
}

function createApp(req, res) {
     (async () => {
          try {
               etcd.mkdir(req.body.id);
               for (let key in req.body) {
                    etcd.set(req.body.id + "/" + key, req.body[key]);
               }
               res.status(200).json(req.body);
          } catch (error) {
               updateApp(req, res);
          }
     })();
}

function updateApp(req, res) {
     (async () => {
          try {
               let id;
               if (req.swagger && req.swagger.params && req.swagger.params.id) {
                    id = decodeURIComponent(req.swagger.params.id.value);
               } else {
                    id = req.body.id;
               }
               etcd.rmdir(id, {recursive: true});
               for (let key in req.body) {
                    etcd.set(req.body.id + "/" + key, req.body[key]);
               }
               res.status(200).json(req.body);
          } catch (error) {
               errorHandler(error, req, res);
          }
     })();
}

function deleteApp(req, res) {
     (async () => {
          try {
               let id = decodeURIComponent(req.swagger.params.id.value);
               etcd.get("", {recursive: true}, function (res, err, msg) {
                    let etcdapps = msg.node.nodes;
                    let typeBool = false;
                    let answer = {};
                    for (let node in etcdapps) {
                         let appsEntry = {};
                         for (let info in etcdapps[node].nodes) {
                              if (etcdapps[node].nodes[info].value == id) {
                                   typeBool = true;
                              }
                              appsEntry[etcdapps[node].nodes[info].key.split("/")[2]] = etcdapps[node].nodes[info].value
                         }
                         if (typeBool == true) {
                              answer = appsEntry;
                         }
                         typeBool = false;
                    }
                    etcd.rmdir(id, {recursive: true});
                    res.status(200).json(answer);
               }.bind(null, res))
          } catch (error) {
               errorHandler(error, req, res);
          }
     })();
}

function getSchema(req, res) {
     (async () => {
          try {
               let result = {"message": "not implemented for etcd yet"};
               res.status(200).json(result);
          } catch (error) {
               errorHandler(error, req, res);
          }
     })();
}