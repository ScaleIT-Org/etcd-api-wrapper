'use strict';

const helper = require('node-helper');
const Etcd = require('node-etcd');
var etcd = new Etcd("127.0.0.1:49501");
const errorHandler = helper.middleware.errorHandler;

module.exports = {
     getApps: getApps,
     getApp: getApp,
     createApp: createApp,
     updateApp: updateApp,
     deleteApp: deleteApp,
     getSchema: getSchema
};

function getApps(req, res) {
     (async () => {
          try {
            let lang = req.swagger.params["Accept-Language"].value || 'de';
            let appType = req.swagger.params.appType.value || undefined;

            etcd.get("", { recursive: true }, function(res, err, msg){
                var etcdapps = msg.node.nodes;
                var typeBool = false;
                var apps = [];
                for(var node in etcdapps) {
                    var appsEntry = {};
                    for(var info in etcdapps[node].nodes) {
                        if (etcdapps[node].nodes[info].value == appType || appType == undefined) { 
                            typeBool = true;
                        }
                        appsEntry[etcdapps[node].nodes[info].key.split("/")[2]] = etcdapps[node].nodes[info].value
                    }
                    if (typeBool == true) {
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
                }
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
               etcd.get("", { recursive: true }, function(res, err, msg){
                var etcdapps = msg.node.nodes;
                var typeBool = false;
                var answer = {};
                for(var node in etcdapps) {
                    var appsEntry = {};
                    for(var info in etcdapps[node].nodes) {
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
               for (var key in req.body) {
                    etcd.set(req.body.id + "/" + key, req.body[key]);
               }
               res.status(200).json(req.body);
          } catch (error) {
               errorHandler(error, req, res);
          }
     })();
}

function updateApp(req, res) {
     (async () => {
          try {
               let id = decodeURIComponent(req.swagger.params.id.value);
               etcd.rmdir(id, { recursive: true });
               for (var key in req.body) {
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
               etcd.get("", { recursive: true }, function(res, err, msg){
                var etcdapps = msg.node.nodes;
                var typeBool = false;
                var answer = {};
                for(var node in etcdapps) {
                    var appsEntry = {};
                    for(var info in etcdapps[node].nodes) {
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
                etcd.rmdir(id, { recursive: true });
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
               let result = {"message":"not implemented for etcd yet"};
               res.status(200).json(result);
          } catch (error) {
               errorHandler(error, req, res);
          }
     })();
}