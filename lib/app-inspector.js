'use strict';

const chalk = require('chalk');
const detect = require('detect-port');

const Server = require('./server');
const _ = require('./common/helper');
const logger = require('./common/logger');

function *parseOptions(options) {
  var port = yield detect(options.port);

  if (port !== parseInt(options.port, 10)) {
    logger.info('port: %d was occupied, changed port: %d', options.port, port);
    options.port = port;
  }
}

function *initDevice(options) {
  const udid = options.udid;
  const isIOS = _.getDeviceInfo(udid).isIOS;

  if (isIOS) {
    yield require('./ios').initDevice(udid);
  } else {
    yield require('./android').initDevice(udid);
  }
}

function *openBrowser(url) {
  var platform = process.platform;
  var linuxShell = platform === 'linux' ? 'xdg-open' : 'open';
  var openShell = platform === 'win32' ? 'start' : linuxShell;
  yield _.exec(`${openShell} ${url}`);
}

module.exports = function *(options) {
  yield parseOptions(options);
  const server = new Server(options);
  yield server.start();
  // const url = `http://${_.ipv4}:${options.port}`;
  const url = `http://${_.ipv4}:${options.port}`;
  logger.debug(`server start at: ${url}`);
  // yield initDevice(options);
  global.serverStarted = true;
  logger.info(`inspector start at: ${chalk.white(url)}/GJ00002919/1`);

  if (!options.silent) {
    yield openBrowser(url);
  }
};
