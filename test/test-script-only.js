var shell = require('shelljs');

require('./build-example')(['--scripts'], function(er) {
  debug('built with error?', er);
  assert.ifError(er);
  assert(test('-d', 'node_modules'));
  var info = require(path.resolve('package.json'));
  assert.equal(info.name, 'loopback-example-app');

  var gitLsOutput = shell.exec('git ls-tree -r --name-only deploy').output;
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
