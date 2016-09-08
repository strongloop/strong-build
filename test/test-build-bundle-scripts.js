// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-build
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var assert = require('assert');
var build = require('./build-example');
var debug = require('debug')('strong-build:test');
var fs = require('fs');
var path = require('path');
var tap = require('tap');
var tar = require('tar');
var util = require('util');

tap.test(function(t) {
  build('suite', ['--install', '--pack', '--bundle', '--scripts'], function(er) {
    assert.ifError(er);
    var info = fs.readJsonSync('package.json');
    var tgz = path.join('..', util.format('%s-%s.tgz', info.name, info.version));

    // iconv build directory should be present

    tar.list(tgz, function(er, paths) {
      var iconvBuildPaths = paths.filter(function(file) {
        return file.match(/iconv\/build/);
      });

      debug('tarfile %s contains iconv build dirs:', tgz, iconvBuildPaths);
      t.assert(iconvBuildPaths.length > 0);
      t.end();
    });
  });
});
