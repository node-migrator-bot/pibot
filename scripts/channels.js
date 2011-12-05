/*
 * scripts/channels.js - Script for channel management
 */

module.exports = function (chat, schemas, router) {

  function dbJoinChannel(e, p) {
    schemas.channels.get('channel/' + e, function (err, obj) {
      if (!obj) {
        schemas.channels.create({_id: 'channel/' + e, name: e, pass: p, active: true}, function (err, channel) {
          if (err) throw err;
          schemas.info('Channel ' + channel.name + ' created');
        });
      } else {
        if (!obj.active) {
          obj.update('channel/' + e, {active: true}, function (err, channel) {
            if (err) throw err;
            schemas.info('Channel ' + channel.name + ' activated');
          });
        }
      }
    });
  }

  function dbPartChannel(e) {
    schemas.channels.get('channel/' + e, function (err, obj) {
      obj.update({active: false}, function (err, channel) {
        if (err) throw err;
        schemas.info('Channel ' + channel.name + ' deactivated');
      });
    });
  }

  chat.opt.channels.forEach(function (e) {
    if (e[0] == '#') e = e.substr(1);
    dbJoinChannel(e, '');
  });

  // TODO: join all channels which are active

  chat.msg(/join ([^\s]*)([^\s]*)?/, function (n, m) {
    if (m[1][0] != '#') m[1] = '#' + m[1];
    if (m[2]) {
      chat.join(m[1] + m[2]);
    } else {
      m[2] = ' '
      chat.join(m[1]);
    }
    dbJoinChannel(m[1].substr(1), m[2].substr(1));
    chat.info('Joined channel ' + m[1]);
  });

  chat.msg(/part ([^\s]*)/, function (n, m) {
    if (m[1][0] != '#') m[1] = '#' + m[1];
    chat.part(m[1]);
    dbPartChannel(m[1].substr(1));
    chat.info('Parted channel ' + m[1]);
  });
}
