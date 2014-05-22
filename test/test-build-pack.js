require('./build-example')(['--install', '-p'], function(er) {
  debug('built with error?', er);
  assert.ifError(er);
  assert(test('-d', 'node_modules'));
  var info = require(path.resolve('package.json'));
  assert.equal(info.name, 'sls-sample-app');
  var tgz = util.format('%s-%s.tgz', info.name, info.version);
  assert(test('-f', tgz), 'expected to find ' + tgz);

  // XXX(sam) open the tgz, and assert something about its contents?
});
