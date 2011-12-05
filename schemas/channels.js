/*
 * schema/channels.js - Resource for channels management
 */

module.exports = function (resourceful, couch) {
  return resourceful.define('channel', function () {
    this.use('couchdb', couch);
    this.property('pass');
    this.property('active', Boolean);
  });
}
