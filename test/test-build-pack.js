var assert = require('assert');
var debug = require('debug')('strong-build:test');
var path = require('path');
var tar = require('tar');
var test = require('shelljs').test;
var util = require('util');

require('./build-example')('suite', ['--install', '-p'], function(er) {
  debug('built with error?', er);
  assert.ifError(er);
  assert(test('-d', 'node_modules'));
  var info = require(path.resolve('package.json'));
  assert.equal(info.name, 'loopback-example-app');
  var tgz = path.join('..', util.format('%s-%s.tgz', info.name, info.version));
  assert(test('-f', tgz), 'expected to find ' + tgz);

  tar.list(tgz, function(er, paths) {
    var bundled = paths.filter(function(path) {
      return path.match(/node_modules/);
    });
    debug('tarfile %s bundles:', tgz, bundled);

    assert.notEqual(bundled.length, 0, 'bundling not requested');
  });
});
