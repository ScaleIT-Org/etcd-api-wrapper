"use strict";
/*******************************************************************
 *   errorHandler.js
 *******************************************************************/
const logger = require('./../lib/logger')('errorHandler.js');
const mongooseErrors = require("mongoose").Error;

function errorHandler(error, req, res, next) {
     if (error.constructor.name === "Error") {
          logger.silly(error);
     }
     res.statusMessage = error._message;
     let httpStatusCode = error.httpStatusCode ? error.httpStatusCode : 500;
     let result = {};
     result.error = {};
     result.error.type = error.name;
     result.error.parentType = error.constructor.name;
     result.error.message = error.message;
     result.error.originalUrl = req.originalUrl;
     if (error instanceof mongooseErrors.ValidationError) {
          result.error.validationErrors = [];
          for (let key in error.errors) {
               let validationError = {};
               validationError.property = key;
               validationError.kind = error.errors[key].kind;
               validationError.message = error.errors[key].message;
               result.error.validationErrors.push(validationError);
          }
     } else if (error.name === "MongoError") {
          if (error.code === 11000) {
               httpStatusCode = 409;
               result.error.duplicateKeys = [];
               let regExp = /"(.*?)"/g;
               let currentMatch;
               while (currentMatch = regExp.exec(error.message)) {
                    result.error.duplicateKeys.push(currentMatch[1]);
               }
          } else {
               httpStatusCode = 400;
          }
     }
     result.error.httpStatusCode = httpStatusCode;
     logger.error(error.message);
     logger.silly(result);
     res.status(httpStatusCode).send(result);
}

module.exports = errorHandler;