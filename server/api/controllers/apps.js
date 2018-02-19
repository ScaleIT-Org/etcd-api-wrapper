'use strict';

const helper = require('node-helper');
const mongodb = helper.mongodb;
const errorHandler = helper.middleware.errorHandler;

module.exports = {
     getApps: getApps,
     getApp: getApp,
     createApp: createApp,
     updateApp: updateApp,
     deleteApp: deleteApp
};

function getApps(req, res) {
     (async () => {
          try {
               let lang = req.swagger.params["Accept-Language"].value || 'de';
               let appType = req.swagger.params.appType.value || undefined;
               let options = mongodb.getOptions("App", req.body, req.query, "id");
               let apps = await mongodb.getObjects("App", options);
               let total = apps.length;
               let result = {
                    appType: appType,
                    lang: lang,
                    total: total,
                    apps: apps
               };
               res.status(200).json(result);
          } catch (error) {
               errorHandler(error, req, res);
          }
     })();
}

function getApp(req, res) {
     (async () => {
          try {
               let id = req.swagger.params.id.value;
               let options = mongodb.getOptions("App", req.body, req.query, "id");
               let result = await mongodb.getObjectById("App", options, {id: id});
               res.status(200).json(result);
          } catch (error) {
               errorHandler(error, req, res);
          }
     })();
}

function createApp(req, res) {
     (async () => {
          try {
               let options = mongodb.getOptions("App", req.body, req.query, "id");
               let result = await mongodb.createObject("App", options, req.body);
               res.status(200).json(result);
          } catch (error) {
               errorHandler(error, req, res);
          }
     })();
}

function updateApp(req, res) {
     (async () => {
          try {
               let id = req.swagger.params.id.value;
               let options = mongodb.getOptions("App", req.body, req.query, "id");
               let result = await mongodb.updateObject("App", options, req.body);
               res.status(200).json(result);
          } catch (error) {
               errorHandler(error, req, res);
          }
     })();
}

function deleteApp(req, res) {
     (async () => {
          let result = {};
          let responseCode = 200;
          try {
               let id = req.swagger.params.id.value;
               let options = mongodb.getOptions("App", req.body, req.query, "id");
               result = await mongodb.deleteObject("App", options, req.body);
               res.status(responseCode).json(result);
          } catch (error) {
               errorHandler(error, req, res);
          }
     })();
}