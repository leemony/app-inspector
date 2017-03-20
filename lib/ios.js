'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const XCTest = require('xctest-client');
const Simulator = require('ios-simulator');

const _ = require('./common/helper');
const logger = require('./common/logger');

function reportNodesError(source) {
  return chalk.red(
    `The source may be wrong, please report with below message at:
    ${chalk.blue('https://github.com/macacajs/app-inspector/issues/new')}
    ****** xctest source start *******
    ${JSON.stringify(JSON.parse(source))}
    '****** xctest source end *******`
  );
}

const adaptor = function(node) {
  node.class = node.type;

  const rect = node.rect;
  node.bounds = [
    rect.x,
    rect.y,
    rect.width,
    rect.height,
  ];

  if (node.children) {
    const children = node.children.length ? node.children : [node.children];

    var nodes = [];
    children.forEach(child => {
      if (parseInt(child.isVisible, 10) || child.type !== 'Window') {
        nodes.push(adaptor(child));
      }
    });

    node.nodes = nodes;
    delete node.children;
  }
  return node;
};

const parseSourceFile = function(caseResultDir, data) {
  _.mkdir(caseResultDir);
  const xmlFilePath = path.join(caseResultDir, 'ios.json');

  const source = JSON.parse(data);
  if (source.sessionId && source.value.tree) {
    const tree = source.value.tree;

    let compatibleTree;
    try {
      compatibleTree = adaptor(tree);
    } catch(e) {
      console.error(reportNodesError(source));
      throw e;
    }

    fs.writeFileSync(xmlFilePath, JSON.stringify(compatibleTree), 'utf8');
    logger.debug(`Dump iOS XML success, save to ${xmlFilePath}`); 

  } else {
    logger.debug(`Session was broken in Source!!!`);
  }
};

var xctest;

exports.dumpXMLAndScreenShot = function *(caseResultId, numberId) {
  const targetDir = path.join(__dirname, '..', '.temp');
  _.mkdir(targetDir);
  const sourceDir = path.join(__dirname, '..', '..');
  // const sourceDir = "E:/web/webFile/case";

  const sourceFilePath = path.join(sourceDir, caseResultId, numberId, 'appInspector', 'sourcenode.txt' );
  const screenshotPath = path.join(sourceDir, caseResultId, numberId, 'appInspector', 'screenshot.png');
  // logger.info(sourceFilePath);
  const caseResultDir = path.join(targetDir, caseResultId, numberId);
  _.mkdir(caseResultDir);

  fs.stat(sourceFilePath, function(err, stat) {
    if (stat && stat.isFile()) {
      // logger.debug(`Source file path ${sourceFilePath} Exist.`);

      fs.readFile(sourceFilePath, 'utf8', function(err, data) {
        if (err) {
          return console.error(`Read Source File Error: ${err}`);
        }
        parseSourceFile(caseResultDir, data);
      })

    } else {
      logger.debug(`Source file path ${sourceFilePath} not exist!!!`);
    }
  });

  fs.stat(screenshotPath, function(err, stat) {
    if (stat && stat.isFile()) {
      // logger.debug(`screenshot png ${screenshotPath} Exist.`);
      const imgFilePath = path.join(caseResultDir, 'ios-screenshot.png');
      fs.writeFileSync(imgFilePath, fs.readFileSync(screenshotPath))
    } else {
      logger.debug(`screenshot png ${screenshotPath} not exist!!!`);
    }
  })
};

exports.initDevice = function *(udid) {
  const isRealIOS = _.getDeviceInfo(udid).isRealIOS;

  var device;

  if (isRealIOS) {
    device = {
      deviceId: udid
    };
  } else {
    device = new Simulator({
      deviceId: udid
    });
  }

  xctest = new XCTest({
    device: device
  });

  yield xctest.start({
    desiredCapabilities: {}
  });

  if (isRealIOS) {
    yield _.sleep(15 * 1000);
  }

  logger.info(`iOS device started: ${udid}`);
};
