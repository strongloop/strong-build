/**
 * Run `node import.js` to import the test data into the db.
 */

var cars = require('./cars.json');
var loopback = require('loopback');
var fs = require('fs');
var path = require('path');
var db = require('../data-sources/db');
var modelsDir = path.join(__dirname, '..', 'models');

// tables we care about
// TOOD - remove this once oracle is cleaned out
var include = [
  'PRODUCT',
  'INVENTORY',
  'LOCATION',
  'CUSTOMER'
];

// discover tables
db.discoverModelDefinitions(function(err, models) {
  if (err) {
    console.log(err);
  } else {
    models.forEach(function(def) {
      if (~include.indexOf(def.name)) {
        console.log('discovering', def.name);

        db.discoverSchema(def.name, function(err, schema) {
          fs.writeFileSync(
            path.join(modelsDir, schema.name.toLowerCase() + '.json'),
            JSON.stringify(schema, null, 2)
          );
        });

        var template = [
        '/**                                                 ',
        ' * Module Dependencies                              ',
        ' */                                                 ',
        '                                                    ',
        'var db = require("../data-sources/db");     ',
        'var config = require("./{name}.json");              ',
        '                                                    ',
        '/**                                                 ',
        ' * {name} Model                                     ',
        ' */                                                 ',
        '                                                    ',
        'var {name} = module.exports = db.createModel(   ',
        '  "{name}",                                         ',
        '  config.properties,                                ',
        '  config.options                                    ',
        ');                                                  '];

        template = template.join('\n').replace(/\{name\}/g, def.name.toLowerCase());
        fs.writeFileSync(path.join(modelsDir, def.name.toLowerCase() + '.js'), template);
      }
    });
  }
});
