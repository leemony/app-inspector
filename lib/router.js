'use strict';

const Router = require('koa-router');

const pgk = require('../package');
const render = require('./render');
const _ = require('./common/helper');
const ios = require('./ios');

const rootRouter = new Router();

module.exports = function(app) {
 rootRouter
    .get('/', function *(next) {
      // console.log(this.params.caseResultId);
      // console.log(this.params.numberId);
      
      // const isIOS = _.getDeviceInfo(this._options.udid).isIOS;
      const isIOS = false;
      const isAndroid = true;

      if (global.serverStarted) {
        if (isIOS) {
          // yield require('./ios').dumpXMLAndScreenShot();
          yield require('./ios').dumpXMLAndScreenShot();
        } else if (isAndroid){
          yield require('./android').dumpXMLAndScreenShot();
        }
      }
      this.body = yield render('index.html', {
        data: {
          isPicExist: true,
          title: pgk.name,
          version: pgk.version,
          isIOS: isIOS,
          serverStarted: global.serverStarted
        }
      });
    });

  rootRouter
    .get('/sayhello', function *(next) {
      this.body = "hello world";
    });

  app
    .use(rootRouter.routes());
};
