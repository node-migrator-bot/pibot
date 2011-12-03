/*
 * scripts/channels.js - Script for channel management
 */

module.exports = function (chat, schemas, router) {
  chat.opt.channels.forEach(function (e) {
    if (e[0] == '#') e = e.substr(1);
    schemas.channels.find({name: e}, function (err, obj) {
      if (obj.length == 0) {
        schemas.channels.create({name: e, active: false}, function (err, channel) {
          schemas.info('Channel: ' + channel.name + ' created');
        });
      } else {
        if (!obj[0].active) {
          obj[0].update({active: true}, function (err, channel) {
            schemas.info('Channel: ' + channel.name + 'activated');
          });
        }
      }
    });
  });
}
