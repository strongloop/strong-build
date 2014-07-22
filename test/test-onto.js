var assert = require('assert');
var debug = require('debug')('strong-build:test');
var fs = require('fs');
var path = require('path');
var tar = require('tar');
var util = require('util');
var vasync = require('vasync');
var zlib = require('zlib');

var shell = require('shelljs/global');

// Check for node silently exiting with code 0 when tests have not passed.
var ok = false;

process.on('exit', function(code) {
  if (code === 0) {
    assert(ok);
  }
});

console.log('pwd: %s', pwd());

// Create two branches that are different, and commit the src
// over the dst, and then diff them to prove identical.
rm('-rf', '_onto');
mkdir('_onto');
cd('_onto');
run('git init');
touchAndCommit('.gitignore');
run('git checkout -b dst master');
touchAndCommit('only-on-dst');
run('git checkout -b src master');
touchAndCommit('only-on-src');

assert(!branchEqual('src', 'dst'));

var build = require('../');

function onto(_, callback) {
  build.build(['node', 'main.js', '--onto=dst'], function(er) {
    if (er) return callback(er);
    assert(branchEqual('src', 'dst'));
    return callback();
  });
}

// simulate build, by generating output
touch('build.out');

function commit(_, callback) {
  build.build(['node', 'main.js', '-c'], function(er) {
    if (er) return callback(er);
    run('git log build.out'); // check build.out was committed
    return callback();
  });
}

// Note we run onto twice, one to prove we can do it onto a branch with a
// different head than ours, and the next time to prove we can do it onto a
// branch with the same head as ours.
vasync.pipeline({funcs: [onto, onto, commit]}, function(er) {
  assert.ifError(er);
  ok = true;
});

// Shell wrappers
function run() {
  var cmd = util.format.apply(util, arguments);
  debug('exec `%s`: ...', cmd);
  var out = exec(cmd, {silent: true});
  out.output = out.output.trim();
  console.log('exec `%s`: (code %s)\n%s', cmd, out.code, out.output);
  if (out.code !== 0) {
    throw Error(error);
  }
  return out.output;
}

function touch(name) {
  console.log('touch %s', name);
  fs.closeSync(fs.openSync(name, 'a'));
}

function touchAndCommit(name) {
  touch(name);
  run('git add %s', name);
  run('git commit -m add-%s', name);
}

function branchEqual(src, dst) {
  try {
    run('git diff --quiet %s %s', src, dst);
    return true;
  } catch(er) {
    return false;
  }
}
