var assert = require('assert');
var async = require('async');
var debug = require('debug')('strong-build:test');
var path = require('path');

require('shelljs/global');

var build = require('../').build;

// Check for node silently exiting with code 0 when tests have not passed.
var ok = false;

process.on('exit', function(code) {
  if (code === 0) {
    assert(ok);
  }
});

function expectError(er) {
  if(er) {
    return null;
  } else {
    return Error('expected error');
  }
}

// argv [0] and [1] are ignored (they are node and script name, not options)
async.parallel([
  build.bind(null, ['', '', '-h']),
  build.bind(null, ['', '', '--help']),
  build.bind(null, ['', '', '-hv']),
  build.bind(null, ['', '', '-v']),
  build.bind(null, ['', '', '--version']),
  build.bind(null, ['', '', '-vh']),
  function(callback) {
    build(['', '', 'no-such-arg'], function(er) {
      return callback(expectError(er));
    });
  },
  function(callback) {
    build(['', '', '--no-such-option'], function(er) {
      return callback(expectError(er));
    });
  },
  function(callback) {
    build(['', '', '-Z'], function(er) {
      return callback(expectError(er));
    });
  },
], function(er, results) {
  debug('test-help: error=%s:', er, results);
  assert.ifError(er);
  ok = true;
});
