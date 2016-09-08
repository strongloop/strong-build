// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-build
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var assert = require('assert');
var debug = require('debug')('strong-build:test');
var path = require('path');
var tap = require('tap');
var sh = require('shelljs');

tap.test('script-only', function(t) {
  require('./build-example')('suite', ['--scripts'], function(er) {
    debug('built with error?', er);
    t.ifError(er);
    t.assert(sh.test('-d', 'node_modules'));
    var info = require(path.resolve('package.json'));
    t.equal(info.name, 'loopback-example-app');

    var gitLsOutput = sh.exec('git ls-tree -r --long deploy', {silent: 1}).output;
    var paths = gitLsOutput.split('\n');
    var bundled = paths.filter(function(path) {
      return path.match(/node_modules/);
    });
    debug('git branch bundles:', bundled);

    t.assert(bundled.length > 0, 'dependencies should be bundled');

    var iconvBuildPaths = paths.filter(function(file) {
      return file.match(/iconv\/build/);
    });

    debug('git branch contains iconv build dirs:', iconvBuildPaths);
    t.assert(iconvBuildPaths.length > 0, 'build scripts should be present');
    t.end();
  });
});
