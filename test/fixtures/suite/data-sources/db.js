/**
 * Dependencies
 */

var loopback = require('loopback');
var config = require('../config');

// Use the memory connector by default.
var DB = (process.env.DB = process.env.DB || 'memory');

// Load the environmental settings for this database.
config = config[config.env][DB];

if (!config) {
  config = {};
}

console.error('Using the %s connector.', DB);
console.error('To specify another connector:');
console.error('  DB=oracle node app or DB=oracle slc run app.js');
console.error('  DB=mongodb node app or DB=mongodb slc run app.js');
console.error('  DB=mysql node app or DB=mysql slc run app.js');

switch (DB) {
  case 'oracle':
  case 'mongodb':
  case 'mysql':
    var m = 'loopback-connector-' + DB;
    try {
      config.connector = require(m);
    } catch (e) {
      console.error('could not require %s', m);
      console.error('make sure it is listed in package.json');
      console.error('then run');
      console.error('  npm install');

      throw e;
    }
  break;
  default:
    config.connector = loopback.Memory;
  break;
}

try {
  module.exports = loopback.createDataSource(config);
} catch (e) {
  console.error('Error while initializing the data source:');
  console.error(e.stack);
  console.error('\nPlease check your configuration settings and try again.');
  process.exit(1);
}

if (DB === 'memory') {
  process.nextTick(function () {
    // import data
    require('../test-data/import');
  });
}
