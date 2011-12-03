/*
 * schema/channels.js - Resource for channels management
 */

module.exports = function (resourceful, couch) {
  return resourceful.define('channel', function () {
    this.use('couchdb', couch);
    this.property('name', {required: true});
    this.property('pass');
    this.property('active', Boolean);
  });
}
