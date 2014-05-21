var debug = require('debug')('strong-build');
var shell = require('shelljs');

var NAME = process.env.SLC_COMMAND ?
  'slc ' + process.env.SLC_COMMAND :
  'slb';

function runCommand(cmd, callback) {
  debug('run command: %s', cmd);
  shell.exec(cmd, {silent: true}, function(code, output) {
    debug('code %d: <<<\n%s>>>', code, output);
    if (code !== 0) {
      var er = Error(cmd);
    }
    return callback(er, output, code);
  });
}

function reportRunError(er, output) {
  if (!er) return;

  console.error("%s: failed to run `%s`", NAME, er.message);
  if (output && output !== '') {
    process.stderr.write(output);
  }
}

exports.build = function build(callback) {
  runCommand('npm install --ignore-scripts', function(er, output) {
    if (er) {
      reportRunError(er, output);
      return callback(er);
    }
    return callback(er);
  });
};
