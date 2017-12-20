'use strict';

const mongodb = require('./../helpers/mongodb');

module.exports = {
     getApps: getApps,
     getApp: getApp,
     createApp: createApp,
     updateApp: updateApp,
     deleteApp: deleteApp
};

function getApps(req, res, next) {
     (async () => {
          let result = {};
          let responseCode = 200;
          try {
               let lang = req.swagger.params["Accept-Language"].value || 'de';
               let appType = req.swagger.params.appType.value || undefined;
               let apps = await mongodb.getObjects("App", req.body, req.query, req.params.id);
               let total = apps.length;
               result = {
                    appType: appType,
                    lang: lang,
                    total: total,
                    apps: apps
               };
          } catch (error) {
               if (error.httpStatusCode) {
                    result = error;
                    responseCode = error.httpStatusCode;
               } else {
                    responseCode = 500;
                    result.message = error.message;
               }
          }
          res.status(responseCode).json(result);
     })();
}

function getApp(req, res) {
     (async () => {
          let result = {};
          let responseCode = 200;
          try {
               let id = req.swagger.params.id.value;
               result = await mongodb.getObjectById("App", req.body, req.query, id, "id");
          } catch (error) {
               if (error.httpStatusCode) {
                    result = error;
                    responseCode = error.httpStatusCode;
               } else {
                    responseCode = 500;
                    result.message = error.message;
               }
          }
          res.status(responseCode).json(result);
     })();
}

function createApp(req, res) {
     (async () => {
          let result = {};
          let responseCode = 200;
          try {
               result = await mongodb.createObject("App", req.body, req.query);
          } catch (error) {
               if (error.httpStatusCode) {
                    result = error;
                    responseCode = error.httpStatusCode;
               } else {
                    responseCode = 500;
                    result.message = error.message;
               }
          }
          res.status(responseCode).json(result);
     })();
}

function updateApp(req, res) {
     (async () => {
          let result = {};
          let responseCode = 200;
          try {
               let id = req.swagger.params.id.value;
               result = await mongodb.updateObject("App", req.body, req.query, id, "id");
          } catch (error) {
               if (error.httpStatusCode) {
                    result = error;
                    responseCode = error.httpStatusCode;
               } else {
                    responseCode = 500;
                    result.message = error.message;
               }
          }
          res.status(responseCode).json(result);
     })();
}

function deleteApp(req, res) {
     (async () => {
          let result = {};
          let responseCode = 200;
          try {
               let id = req.swagger.params.id.value;
               result = await mongodb.deleteObject("App", req.body, req.query, id, "id");
          } catch (error) {
               if (error.httpStatusCode) {
                    result = error;
                    responseCode = error.httpStatusCode;
               } else {
                    responseCode = 500;
                    result.message = error.message;
               }
          }
          res.status(responseCode).json(result);
     })();
}