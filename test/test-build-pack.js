// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-build
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var assert = require('assert');
var debug = require('debug')('strong-build:test');
var path = require('path');
var tap = require('tap');
var tar = require('tar');
var test = require('shelljs').test;
var util = require('util');

tap.test('build-pack', function(t) {
  require('./build-example')('suite', ['--install', '-p'], function(er) {
    debug('built with error?', er);
    t.ifError(er);
    t.assert(test('-d', 'node_modules'));
    var info = require(path.resolve('package.json'));
    t.equal(info.name, 'loopback-example-app');
    var tgz = path.join('..', util.format('%s-%s.tgz', info.name, info.version));
    t.assert(test('-f', tgz), 'expected to find ' + tgz);

    tar.list(tgz, function(er, paths) {
      var bundled = paths.filter(function(path) {
        return path.match(/node_modules/);
      });
      debug('tarfile %s bundles:', tgz, bundled);

      t.notEqual(bundled.length, 0, 'bundling not requested');
      t.end();
    });
  });
});
