/*
 * schema/channels.js - Resource for channels management
 */

module.exports = function (resourceful, couch) {
  return resourceful.define('channel', function () {
    this.use('couchdb', couch);

    this.string('name');
    this.string('pass');
    this.bool('active');

    this.filter('active', {active: true});
  });
}
