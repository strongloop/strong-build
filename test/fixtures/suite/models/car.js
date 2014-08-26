/**
 * Module Dependencies
 */

var db = require('../data-sources/db');
var config = require('./car.json');

/**
 * product Model
 */

var Car = db.createModel(
  'car',
  config.properties,
  config.options
);

module.exports = Car;