var assert = require('assert');
var build = require('./build-example');
var debug = require('debug')('strong-build:test');
var fs = require('fs');
var path = require('path');
var tar = require('tar');
var util = require('util');

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
    assert(iconvBuildPaths.length > 0);
  });
});
