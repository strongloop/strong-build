var assert = require('assert');
var debug = require('debug')('strong-build:test');
var test = require('shelljs').test;

require('./build-example')('zero-dependency', ['-i'], function(er) {
  debug('built with error?', er);
  assert.ifError(er);
  if (process.versions.node.split('.')[0] === '5') {
    assert(test('-d', 'node_modules'), 'node_modules created');
  } else {
    assert(!test('-d', 'node_modules'), 'no node_modules created');
  }
});
