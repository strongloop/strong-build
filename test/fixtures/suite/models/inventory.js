/**
 * Module Dependencies
 */

var db = require('../data-sources/db');
var config = require('./inventory.json');

/**
 * inventory Model
 */

var inventory = module.exports = db.createModel(
  'inventory',
  config.properties,
  config.options
);
