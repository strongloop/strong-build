var assert = require('assert');
var debug = require('debug')('strong-build:test');
var fmt = require('util').format;
var fs = require('fs');
var sh = require('shelljs');
var tar = require('tar');
var zlib = require('zlib');

module.exports = function buildExample(fixture, args, callback) {
  tar.list = function list(tarfile, callback) {
    var paths = [];

    fs.createReadStream(tarfile)
    .on('error', callback)
    .pipe(zlib.Unzip())
    .pipe(tar.Parse())
    .on('entry', function(entry) {
      paths.push(entry.path);
    })
    .on('end', function() {
      debug('tarfile %s list:', tarfile, paths);
      return callback(null, paths);
    });
  };

  fs.readJsonSync = function readJsonSync(file) {
    return JSON.parse(fs.readFileSync(file));
  };

  var build = require('../');

  // Check for node silently exiting with code 0 when tests have not passed.
  var ok = false;

  process.on('exit', function(code) {
    if (code === 0) {
      assert(ok);
    }
  });

  sh.rm('-rf', '_suite');
  sh.cp('-Rf', fmt('fixtures/%s/*', fixture), '_suite');
  sh.cd('_suite');
  assert(sh.test('-f', 'package.json'));
  assert(!sh.test('-d', 'node_modules'));

  var argv = ['node', 'slb'].concat(args);

  debug('build with argv:', argv);

  build.build(argv, function(er) {
    ok = true;
    if (process.env.CI && process.platform !== 'win32') {
      debug('committing writes before continuing with test...');
      sh.exec('sync');
      return setTimeout(function() {
        callback(er);
      }, 1000);
    }
    return callback(er);
  });

  debug('waiting for build...');
};
