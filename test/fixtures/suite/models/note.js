// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-build
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

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
