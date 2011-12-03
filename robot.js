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
  , winston = require('winston').cli()
  , irc = require('irc')
  , director = require('director')
  , resourceful = require('resourceful')
  , fs = require('fs')
  , http = require('http')
  , path = require('path')

/*
 * Initialize pibot
 */
pibot.init = function (conf, paths) {
  pibot.schemas = { info: function (str) {winston.info(str.green);} };
  pibot.loadConfig(conf);
  pibot.buildIRC();
  pibot.buildDB();
  pibot.buildHTTP();
  pibot.loadPaths(paths || []);
}

/*
 * Load configuration
 */
pibot.loadConfig = function (conf) {
  winston.info('Loading configuration'.cyan);
  nconf.file({ file: conf || path.resolve(path.join(__dirname, 'config.json'))});
  nconf.defaults({});
}

/*
 * Build IRC client
 */
pibot.buildIRC = function () {
  pibot.chat = new irc.Client(nconf.get('server'), nconf.get('nick'), {
    port: nconf.get('port'),
    password: nconf.get('password'),
    userName: nconf.get('username'),
    realName: nconf.get('realname'),
    channels: nconf.get('channels')
  });
  winston.info('Initial IRC connection established!'.blue);
}

/*
 * Build DB client
 */
pibot.buildDB = function () {
  pibot.couch = {
    host: nconf.get('db').host,
    port: nconf.get('db').port,
    auth: nconf.get('db').auth,
    database: nconf.get('db').name
  };
}

/*
 * Build HTTP server
 */
pibot.buildHTTP = function () {
  pibot.router = new director.http.Router({
    '/': {
      get: function () {
        var res = this.res;
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.readFile(path.join(__dirname, 'scaffold', 'index.html'), 'utf8', function (err, data) {
          if (err) throw err;
          data = data.replace('botname', nconf.get('nick'));
          res.end(data.replace('botname', nconf.get('nick')), 'utf8');
        });
      }
    },
    '/ninja.jpg': {
      get: function () {
        var res = this.res;
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        fs.readFile(path.join(__dirname, 'scaffold', 'ninja.jpg'), function (err, data) {
          if (err) throw err;
          res.end(data, 'binary');
        });
      }
    },
    '/ninja.woff': {
      get: function () {
        var res = this.res;
        res.writeHead(200, {'Content-Type': 'application/x-font-woff'});
        fs.readFile(path.join(__dirname, 'scaffold', 'ninja.woff'), function (err, data) {
          if (err) throw err;
          res.end(data, 'binary');
        });
      }
    }
  });
  http.createServer(function (req, res) {
    pibot.router.dispatch(req, res, function (noroute) {
      if (noroute) {
        res.writeHead(404, {'Content-type': 'text/html'});
        fs.readFile(path.join(__dirname, 'scaffold', 'error.html'), 'utf8', function (err, data) {
          if (err) throw err;
          res.end(data.replace('botname', nconf.get('nick')), 'utf8');
        });
      }
    });
  }).listen(3000);
}

/*
 * Load scripts & schemas from multiple paths
 */
pibot.loadPaths = function (paths) {
  paths.push(path.resolve(__dirname));
  paths.forEach(function (e,i,a) {
    pibot.loadPath(e);
  });
}

/*
 * Load scripts & schemas from a single path
 */
pibot.loadPath = function (dir) {
  pibot.loadSchemas(path.join(dir, 'schemas'));
  pibot.loadScripts(path.join(dir, 'scripts'));
}

/*
 * Load schemas from a single path
 */
pibot.loadSchemas = function (dir) {
  winston.info(('Loading schemas from ' + dir).yellow);
  if (path.existsSync(dir)) {
    fs.readdirSync(dir).forEach(function (e,i,a) {
      pibot.loadSchema(dir, e);
    });
  } else {
    winston.error(('No path exists, ' + dir).yellow);
  }
}

/*
 * Load scripts from a single path
 */
pibot.loadScripts = function (dir) {
  winston.info(('Loading scripts from ' + dir).magenta);
  if (path.existsSync(dir)) {
    fs.readdirSync(dir).forEach(function (e,i,a) {
      pibot.loadScript(dir, e);
    });
  } else {
    winston.error(('No path exists, ' + dir).magenta);
  }
}

/*
 * Load a single schema
 */
pibot.loadSchema = function (dir, schema) {
  if (path.extname(schema) == '.js') {
    try {
      var modulename = path.basename(schema, '.js');
      winston.info(('Loading schema "' + modulename + '" from ' + path.join(dir, schema)).yellow);
      pibot.schemas[modulename] = require(path.join(dir, modulename))(resourceful, pibot.couch);
    } catch (err) {
      winston.error(err);
    }
  }
}

/*
 * Load a single script
 */
pibot.loadScript = function (dir, script) {
  if (path.extname(script) == '.js') {
    try {
      var modulename = path.basename(script, '.js');
      winston.info(('Loading script "' + modulename + '" from ' + path.join(dir, script)).magenta);
      require(path.join(dir, modulename))(pibot.chat, pibot.schemas, pibot.router);
    } catch (err) {
      winston.error(err);
    }
  }
}
