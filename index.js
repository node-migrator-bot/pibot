/*
 * pibot.js - Top level script for pibot
 *
 * Copyright © 2011 Pavan Kumar Sunkara. All rights reserved
 */

var pibot = module.exports;

/*
 * Requring modules
 */
var nconf = require('nconf')
    , winston = require('winston')
    , irc = require('irc')
    , schema = require('./schema')
    , fs = require('fs')
    , path = require('path')

/*
 * Initialize pibot
 */
pibot.init = function (conf, paths) {
  pibot.loadConfig(conf);
  pibot.buildIRC();
  pibot.buildDB();
  pibot.buildHTTP();
  pibot.loadPaths(paths);
}

/*
 * Load configuration
 */
pibot.loadConfig = function (conf) {
  winston.info('Loading configuration');
  nconf.file({ file: conf || path.resolve(path.join(__dirname, 'config.json'))});
  nconf.defaults({});
}

/*
 * Build IRC client
 */
pibot.buildIRC = function () {
  pibot.client = new irc.Client(nconf.get('server'), nconf.get('nick'), {
    port: nconf.get('port'),
    password: nconf.get('password'),
    userName: nconf.get('username'),
    realName: nconf.get('realname'),
    channels: nconf.get('channels')
  });
  winston.info('Initial connection established!');
}

/*
 * Build DB client
 */
pibot.buildDB = function () {
  pibot.couch = schema({
    host: nconf.get('db').host,
    port: nconf.get('db').port,
    auth: nconf.get('db').auth,
    database: nconf.get('db').name
  });
}

/*
 * Build HTTP server
 */
pibot.buildHTTP = function () {
}

/*
 * Load scripts from multiple paths
 */
pibot.loadPaths = function (paths) {
  paths.push(path.resolve(path.join(__dirname, 'scripts')));
  paths.forEach(function (e,i,a) {
    pibot.loadPath(e);
  });
}

/*
 * Load scripts from a single path
 */
pibot.loadPath = function (dir) {
  winston.info('Loading scripts from ' + dir);
  path.exists(dir, function (exists) {
    if (exists) {
      fs.readdir(dir, function (err, files) {
        if (err) {
          winston.error('Cannot read directory, ' + dir);
        } else {
          files.forEach(function (e,i,a) {
            pibot.loadScript(dir, e);
          });
        }
      });
    } else {
      winston.error('No path exists, ' + dir);
    }
  });
}

/*
 * Load a script
 */
pibot.loadScript = function (dir, script) {
  try {
    require(path.join(dir, path.basename(script)))(pibot.client, pibot.couch);
  } catch (err) {
    winston.error(err);
  }
}
