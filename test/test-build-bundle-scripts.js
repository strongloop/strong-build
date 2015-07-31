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

  // strong-fork-syslog build directory should be present

  tar.list(tgz, function(er, paths) {
    var syslogBuildPaths = paths.filter(function(file) {
      return file.match(/strong-fork-syslog\/build/);
    });

    debug('tarfile %s contains syslog build dirs:', tgz, syslogBuildPaths);
    assert(syslogBuildPaths.length > 0);
  });
});
