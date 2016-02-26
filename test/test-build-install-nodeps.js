var assert = require('assert');
var debug = require('debug')('strong-build:test');
var find = require('shelljs').find;
var test = require('shelljs').test;

require('./build-example')('zero-dependency', ['-i'], function(er) {
  debug('built with error?', er);
  assert.ifError(er);
  if (test('-d', 'node_modules')) {
    assert.deepEqual(find('node_modules'), ['node_modules'], 'empty directory');
  }
});
