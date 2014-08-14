/**
 * Module Dependencies
 */

var db = require('../data-sources/db');
var config = require('./customer.json');
var loopback = require('loopback');

/**
 * customer Model
 */

var customer = module.exports = loopback.User.extend(
  'customer',
  config.properties,
  config.options
);

// attach to the db
customer.attachTo(db);

// TODO - this should be available as `hideRemotely: true`
customer.beforeRemote('find', function(ctx, inst, next) {
  var args = ctx.args;
  var filter = args.filter || (args.filter = {});
  var fields = filter.fields || (filter.fields = {});

  // always hide password
  fields.password = false;

  next();
});
