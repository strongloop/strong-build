/**
 * Module Dependencies
 */

var db = require('../data-sources/db');
var config = require('./note.json');

/**
 * Ammo Model
 */

var Note = module.exports = db.createModel(
  'note',
  config.properties,
  config.options
);
