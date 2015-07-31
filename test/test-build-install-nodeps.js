require('./build-example')('zero-dependency', ['-i'], function(er) {
  debug('built with error?', er);
  assert.ifError(er);
  assert(!test('-d', 'node_modules'), 'no node_modules created');
});
