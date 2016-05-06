// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-build
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

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
