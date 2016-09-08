// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-build
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var debug = require('debug')('strong-build:test');
var find = require('shelljs').find;
var tap = require('tap');
var test = require('shelljs').test;

tap.test('build-install-nodeps', function(t) {
  require('./build-example')('zero-dependency', ['-i'], function(er) {
    debug('built with error?', er);
    t.ifError(er);
    if (test('-d', 'node_modules')) {
      t.deepEqual(find('node_modules'), ['node_modules'], 'empty directory');
    }
    t.end();
  });
});
