/*
 * scripts/channels.js - Script for channel management
 */

module.exports = function (chat, schemas, router) {
  chat.opt.channels.forEach(function (e) {
    if (e[0] == '#') e = e.substr(1);
    schemas.channels.get('channel/' + e, function (err, obj) {
      if (!obj) {
        schemas.channels.create({_id: 'channel/' + e, active: false}, function (err, channel) {
          if (err) throw err;
          schemas.info('Channel: ' + channel._id + ' created');
        });
      } else {
        if (!obj.active) {
          obj.update({active: true}, function (err, channel) {
            if (err) throw err;
            schemas.info('Channel: ' + channel._id + ' activated');
          });
        }
      }
    });
  });
}
