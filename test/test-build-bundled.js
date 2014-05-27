var lodash = require('lodash');
require('./build-example')(['--install', '-p', '--bundle'], function(er) {
  assert.ifError(er);
  var info = fs.readJsonSync('package.json');
  var tgz = path.join('..', util.format('%s-%s.tgz', info.name, info.version));

  // loopback should be bundled (normal dep)
  // loopback-connector-mysql should be bundled (optional dep)
  // mocha should not (dev dep)
  function isBundled(bundled, name) {
    return lodash.findIndex(bundled, function(_) {
      return _ === name;
    }) >= 0;
  }
  debug('package bundles:', info.bundleDependencies);
  assert(isBundled(info.bundleDependencies, 'loopback'));
  assert(isBundled(info.bundleDependencies, 'loopback-connector-mysql'));
  assert(!isBundled(info.bundleDependencies, 'mocha'));

  tar.list(tgz, function(er, paths) {
    debug('tarfile %s bundles:', tgz, bundled);
    var bundled = lodash(paths).map(function(_) {
      // We are looking for the top-level bundled deps, they look like
      //   package/node_modules/shuffle/package.json
      var components = _.split(path.sep);

      if (components.length === 4 && components[3] === 'package.json') {
        return components[2];
      }
      return undefined;
    }).compact().sort().value();
    debug('tarfile %s bundles:', tgz, bundled);
    debug('should be:', info.bundleDependencies);
    assert.deepEqual(bundled, info.bundleDependencies);
  });
});
