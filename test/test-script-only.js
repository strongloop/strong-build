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

  var gitLsOutput = sh.exec('git ls-tree -r --long deploy', {silent: 1}).output;
  var paths = gitLsOutput.split('\n');
  var bundled = paths.filter(function(path) {
    return path.match(/node_modules/);
  });
  debug('git branch bundles:', bundled);

  assert(bundled.length > 0, 'dependencies should be bundled');

  var iconvBuildPaths = paths.filter(function(file) {
    return file.match(/iconv\/build/);
  });

  debug('git branch contains iconv build dirs:', iconvBuildPaths);
  assert(iconvBuildPaths.length > 0, 'build scripts should be present');
});
