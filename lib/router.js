'use strict';

const Router = require('koa-router');

const pgk = require('../package');
const render = require('./render');
const _ = require('./common/helper');

const rootRouter = new Router();

module.exports = function(app) {
 rootRouter
    .get('/:caseResultId/:numberId', function *(next) {
      const isIOS = _.getIdInfo(this.params.caseResultId).isIOS;

      if (global.serverStarted) {
        if (isIOS) {
          yield require('./ios').dumpXMLAndScreenShot(this.params.caseResultId, this.params.numberId);
        } else {
          console.log('URL address Error!!!');
        }
      }
      this.body = yield render('index.html', {
        data: {
          isPicExist: _.isPicExist(this.params.caseResultId, this.params.numberId, null),
          title: pgk.name,
          version: pgk.version,
          isIOS: isIOS,
          serverStarted: global.serverStarted
        }
      });
    });

  rootRouter
    .get('/:caseResultId/:mobileID/:numberId', function *(next) {
      const isAndroid = _.getIdInfo(this.params.caseResultId).isAndroid;

      if (global.serverStarted) {
        if (isAndroid) {
          yield require('./android').dumpXMLAndScreenShot(this.params.caseResultId, this.params.numberId, this.params.mobileID);
        } else {
          console.log('URL address Error!!!');
        }
      }
      this.body = yield render('index.html', {
        data: {
          isPicExist: _.isPicExist(this.params.caseResultId, this.params.numberId, this.params.mobileID),
          title: pgk.name,
          version: pgk.version,
          isIOS: false,
          serverStarted: global.serverStarted
        }
      });
    });

  rootRouter
    .get('/sayhello', function *(next) {
      this.body = 'hello';
    });

  app
    .use(rootRouter.routes());
};
