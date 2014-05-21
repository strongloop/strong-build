var assert = require('assert');
var debug = require('debug')('strong-build:test');
var path = require('path');

require('shelljs/global');

var build = require('../');

// Check for node silently exiting with code 0 when tests have not passed.
var ok = false;

process.on('exit', function(code) {
  if (code === 0) {
    assert(ok);
  }
});


debug('test:', 'build slc example');
debug('cwd:', pwd());
debug('which slc:', which('slc'), exec('slc -v', {silent: true}).output);

rm('-rf', '_suite');
exec('slc example suite _suite --no-install', {silent: true});
cd('_suite');
assert(!test('-d', 'node_modules'));

build.build(function(er) {
  debug('built with error?', er);
  assert.ifError(er);
  assert(test('-d', 'node_modules'));

  var addons = find('node_modules').filter(function(path) {
    // .../mongodb/node_modules/bson/ contains compiled addons. Others could in
    // the future, but for now, this will assert addons weren't compiled during
    // the `npm install`
    return path.match(/.*\.node$/) && !path.match(/node_modules\/bson/);
  });

  debug('addons:', addons);

  assert.equal(addons.length, 0);

  ok = true;
});

debug('waiting for build...');
