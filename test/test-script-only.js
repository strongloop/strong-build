var assert = require('assert');
var debug = require('debug')('strong-build:test');
var path = require('path');
var sh = require('shelljs');

require('./build-example')('suite', ['--scripts'], function(er) {
  debug('built with error?', er);
  assert.ifError(er);
  assert(sh.test('-d', 'node_modules'));
  var info = require(path.resolve('package.json'));
  assert.equal(info.name, 'loopback-example-app');

  var gitLsOutput = sh.exec('git ls-tree -r --long deploy').output;
  var paths = gitLsOutput.split('\n');
  var bundled = paths.filter(function(path) {
    return path.match(/node_modules/);
  });
  debug('git branch bundles:', bundled);

  assert(bundled.length > 0, 'dependencies should be bundled');

  var syslogBuildPaths = paths.filter(function(file) {
    return file.match(/strong-fork-syslog\/build/);
  });

  debug('git branch contains syslog build dirs:', syslogBuildPaths);
  assert(syslogBuildPaths.length > 0, 'build scripts should be present');
});
