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
    , irc = require('irc');

/*
 * Load configuration
 */
winston.info('Loading configuration');
nconf.file({ file: 'config.json'});
nconf.defaults({});

/*
 * Build IRC client
 */
var client = new irc.Client(nconf.get('server'), nconf.get('nick'), {
  port: nconf.get('port'),
  password: nconf.get('password'),
  userName: nconf.get('username'),
  realName: nconf.get('realname'),
  channels: nconf.get('channels')
});
winston.info('Initial connection established!');

/*
 * Load scripts from the scripts folder
 */
