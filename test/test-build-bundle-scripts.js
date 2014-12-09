var lodash = require('lodash');
var build = require('./build-example');

build(['--install', '--pack', '--bundle', '--scripts'], function(er) {
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
