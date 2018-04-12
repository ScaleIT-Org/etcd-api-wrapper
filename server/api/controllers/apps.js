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
                    let apps = [];
                    if (msg.node.nodes && msg.node.nodes.length > 0 && msg.node.nodes[0].key === "/apps") {
                         let etcdapps = msg.node.nodes[0].nodes;
                         if (etcdapps && etcdapps.length > 0) {
                              for (let directory of etcdapps) {
                                   let typeBool = true;
                                   let appsEntry = {};
                                   for (let node of directory.nodes) {
                                        let key = node.key.split("/")[3];
                                        if (appType && (key === "appType" && node.value !== appType)) {
                                             typeBool = false;
                                        }
                                        appsEntry[key] = node.value
                                   }
                                   if (typeBool) {
                                        apps.push(appsEntry);
                                   }
                              }
                         }
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
                    let answer = {};
                    if (msg.node.nodes && msg.node.nodes.length > 0 && msg.node.nodes[0].key === "/apps") {
                         let etcdapps = msg.node.nodes[0].nodes;
                         let typeBool = false;
                         for (let directory of etcdapps) {
                              let appsEntry = {};
                              for (let node of directory.nodes) {
                                   let key = node.key.split("/")[3];
                                   if (id && (key === "id" && node.value === id)) {
                                        typeBool = true;
                                   }
                                   appsEntry[key] = node.value
                              }
                              if (typeBool === true) {
                                   answer = appsEntry;
                              }
                              typeBool = false;
                         }
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
               //TODO to support multiple instances of apps req.body.id should be used instead of req.body.name
               etcd.mkdir("/apps/" + req.body.name);
               for (let key in req.body) {
                    etcd.set("/apps/" + req.body.name + "/" + key, req.body[key]);
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
               //TODO to support multiple instances of apps req.body.id should be used instead of req.body.name
               etcd.rmdir(req.body.name, {recursive: true});
               for (let key in req.body) {
                    etcd.set("/apps/" + req.body.name + "/" + key, req.body[key]);
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
                    let answer = {};
                    if (msg.node.nodes && msg.node.nodes.length > 0 && msg.node.nodes[0].key === "/apps") {
                         let etcdapps = msg.node.nodes[0].nodes;
                         let typeBool = false;
                         for (let directory of etcdapps) {
                              let appsEntry = {};
                              for (let info in etcdapps[directory].nodes) {
                                   if (etcdapps[directory].nodes[info].value === id) {
                                        typeBool = true;
                                   }
                                   appsEntry[etcdapps[directory].nodes[info].key.split("/")[2]] = etcdapps[directory].nodes[info].value
                              }
                              if (typeBool) {
                                   answer = appsEntry;
                              }
                              typeBool = false;
                         }
                         etcd.rmdir(id, {recursive: true});
                    }
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
               let result = require('yamljs').load('./api/definitions/schemas/App.yaml');
               res.status(200).json(result);
          } catch (error) {
               errorHandler(error, req, res);
          }
     })();
}