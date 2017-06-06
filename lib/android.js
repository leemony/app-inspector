'use strict';

const fs = require('fs');
const path = require('path');
const ADB = require('macaca-adb');
const xml2map = require('xml2map');
const UIAutomator = require('uiautomator-client');

const _ = require('./common/helper');
const logger = require('./common/logger');

var adb;
var uiautomator;

const adaptor = function(node) {
  const bounds = node.bounds.match(/[\d\.]+/g);
  node.rawtext = node.text;

  // [ x, y, width, height]
  node.bounds = [
    ~~bounds[0],
    ~~bounds[1],
    bounds[2] - bounds[0],
    bounds[3] - bounds[1],
  ];

  if (node.node) {
    node.nodes = node.node.length ? node.node : [node.node];
    node.nodes.forEach(adaptor);

    delete node.node;
  }
  return node;
};


exports.dumpXMLAndScreenShot = function *() {

  const targetDir = path.join(__dirname, '..', '.temp');
  _.mkdir(targetDir);

  const sourceFilePath = _.getDataPathLocal().sourceFilePath;
  const screenshotPath = _.getDataPathLocal().screenshotPath;

  const xmlFilePath = path.join(targetDir, 'android.json');

  fs.stat(sourceFilePath, function(err, stat) {
    if (stat && stat.isFile()) {
      logger.debug(`Source file path ${sourceFilePath} Exist.`);

      fs.readFile(sourceFilePath, 'utf8', function(err, data) {
        if (err) {
          return console.error(`Read Source File Error: ${err}`);
        }
        var xml = data;
        xml = xml.replace(/content-desc=\"\"/g, 'content-desc="null"');

        const hierarchy = xml2map.tojson(xml).hierarchy;

        logger.info(`Dump Android XML success, save to ${xmlFilePath}`);

        var data = adaptor(hierarchy.node);
        fs.writeFileSync(xmlFilePath, JSON.stringify(data), 'utf8');
      })

    } else {
      logger.debug(`Source file path ${sourceFilePath} not exist!!!`);
    }
  });
  
  fs.stat(screenshotPath, function(err, stat) {
    if (stat && stat.isFile()) {
      logger.debug(`screenshot png ${screenshotPath} Exist.`);
      const imgFilePath = path.join(targetDir, 'android-screenshot.png');
      fs.writeFileSync(imgFilePath, fs.readFileSync(screenshotPath));
    } else {
      logger.debug(`screenshot png ${screenshotPath} not exist!!!`);
    }
  })
};

exports.initDevice = function *(udid) {
  adb = new ADB();
  adb.setDeviceId(udid);
  uiautomator = new UIAutomator();
  yield uiautomator.init(adb);

  logger.info(`Android device started: ${udid}`);
};
