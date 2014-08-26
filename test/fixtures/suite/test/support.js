/**
 * Force memory adapter
 */

/**
 * Utils
 */
process.env.NODE_ENV = 'test';

request = require('supertest');
app = require('../app');
assert = require('assert');
importer = require('../test-data/import');

/**
 * Test Data
 */

testData = {
  cars: require('../test-data/cars'),
  locations: require('../test-data/locations')
};

before(function(done) {
  this.timeout(50000);
  console.error('Importing test data, this may take long time.');
  importer.on('error', done);
  importer.on('done', done);
});
