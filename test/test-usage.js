// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-build
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var assert = require('assert');
var async = require('async');
var build = require('../').build;
var debug = require('debug')('strong-build:test');

// Check for node silently exiting with code 0 when tests have not passed.
var ok = false;

process.on('exit', function(code) {
  if (code === 0) {
    assert(ok);
  }
});

function expectError(er) {
  if (er) {
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
