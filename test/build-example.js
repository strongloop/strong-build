module.exports = function buildExample(args, callback) {
  assert = require('assert');
  debug = require('debug')('strong-build:test');
  path = require('path');
  util = require('util');

  require('shelljs/global');

  var build = require('../');

  // Check for node silently exiting with code 0 when tests have not passed.
  var ok = false;

  process.on('exit', function(code) {
    if (code === 0) {
      assert(ok);
    }
  });


  debug('test: build slc example, args:', args);
  debug('cwd:', pwd());
  debug('which slc:', which('slc'), exec('slc -v', {silent: true}).output);

  rm('-rf', '_suite');
  exec('slc example suite _suite --no-install', {silent: true});
  cd('_suite');
  assert(!test('-d', 'node_modules'));

  var argv = ['node', 'slb'].concat(args);

  debug('build with argv:', argv);

  build.build(argv, function(er) {
    ok = true;
    return callback(er)
  });

  debug('waiting for build...');
};
