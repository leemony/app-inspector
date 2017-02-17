'use strict';

const logger = require('xlogger');

const options = {
  logToStd: false,
  closeFile: false
};

module.exports = logger.Logger(options);
module.exports.middleware = logger.middleware(options);
