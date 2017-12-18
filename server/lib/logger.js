"use strict";
/*******************************************************************
 *   logger.js
 *******************************************************************/
const winstonLogger = require('winston');
const util = require('util');
const config = require('./logger.json');
winstonLogger.clear();

if ((process.env.LOG_LEVEL_CONSOLE && process.env.LOG_LEVEL_CONSOLE !== "none")|| config.logger.console.active) {
     let level = process.env.LOG_LEVEL_CONSOLE ? process.env.LOG_LEVEL_CONSOLE : config.logger.console.level;
     winstonLogger.add(winstonLogger.transports.Console, {
          level: level,
          colorize: config.logger.console.colorize,
          handleExceptions: true,
          timestamp: timestamp
     });
}

if ((process.env.LOG_LEVEL_FILE && process.env.LOG_LEVEL_FILE !== "none") || config.logger.file.active) {
     let level = process.env.LOG_LEVEL_FILE ? process.env.LOG_LEVEL_FILE : config.logger.file.level;
     winstonLogger.add(winstonLogger.transports.File, {
          filename: config.logger.file.filename,
          level: level,
          timestamp: timestamp
     });
}

winstonLogger.setLevels(config.levels);

module.exports = function (fileName) {
     let logger = {};
     for (let key in config.levels) {
          logger[key] = function (...args) {
               log(key, fileName, ...args);
          }
     }
     logger.stream = {
          write: function (message) {
               logger.info(message.substring(0, message.lastIndexOf('\n')));
          }
     };
     return logger;
};

function timestamp() {
     let now = new Date();
     return now.toLocaleDateString(config.locale) + " " + now.toLocaleTimeString(config.locale);
}

function log(method, filename, ...args) {
     let text = util.format(...args);
     if (config.filename) {
          winstonLogger[method]('[' + filename + ']', text);
     } else {
          winstonLogger[method](text);
     }
}