'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
// const XCTest = require('xctest-client');
// const Simulator = require('ios-simulator');

const _ = require('./common/helper');
const logger = require('./common/logger');

function reportNodesError(source) {
  // JSON.parse(source)
  return chalk.red(
    `The source may be wrong, please report with below message at:
    ${chalk.blue('https://github.com/macacajs/app-inspector/issues/new')}
    ****** xctest source start *******
    ${JSON.stringify(source)}
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
      // if (parseInt(child.isVisible, 10) || child.type !== 'Window') {
      // isVisible: 1,0 -> true,false
      if (child.isVisible || child.type !== 'Window') {
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

  var source;
  try {
    source = JSON.parse(data);
  } catch(e) {
    console.error(e);
  }

  var tree;
  if (source.status === 0) {
    tree = source.value.tree ? source.value.tree : source.value; // test case 1,2
  } else {
    tree = source; // test case 7
  }

  let compatibleTree;
  try {
    compatibleTree = adaptor(tree);
  } catch(e) {
    console.error(reportNodesError(source));
    // throw e;
  }

  fs.writeFileSync(xmlFilePath, JSON.stringify(compatibleTree), 'utf8');
  logger.debug(`Dump iOS XML success, save to ${xmlFilePath}`); 

};

exports.dumpXMLAndScreenShot = function *(caseResultId, numberId) {
  const targetDir = path.join(__dirname, '..', '.temp');
  _.mkdir(targetDir);

  const sourceFilePath = _.getDataPath(caseResultId, numberId, true, null).sourceFilePath;
  const screenshotPath = _.getDataPath(caseResultId, numberId, true, null).screenshotPath;

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
      });

    } else {
      logger.debug(`Source file path ${sourceFilePath} not exist!!!`);
    }
  });

  fs.stat(screenshotPath, function(err, stat) {
    if (stat && stat.isFile()) {
      // logger.debug(`screenshot png ${screenshotPath} Exist.`);
      const imgFilePath = path.join(caseResultDir, 'ios-screenshot.png');
      fs.writeFileSync(imgFilePath, fs.readFileSync(screenshotPath));
    } else {
      logger.debug(`screenshot png ${screenshotPath} not exist!!!`);
    }
  });
};
