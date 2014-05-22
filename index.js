var debug = require('debug')('strong-build');
var Parser = require('posix-getopt').BasicParser;
var path = require('path');
var shell = require('shelljs');

function printHelp($0, prn) {
  prn('usage: %s [options]', $0);
  prn('');
  prn('Build a node application archive.');
  prn('');
  prn('Options:');
  prn('  -h,--help          Print this message and exit.');
  prn('  -v,--version       Print version and exit.');
}

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

  console.error("Failed to run `%s`:", er.message);
  if (output && output !== '') {
    process.stderr.write(output);
  }
}

exports.build = function build(argv, callback) {
  var $0 = process.env.SLC_COMMAND ?
    'slc ' + process.env.SLC_COMMAND :
    path.basename(argv[1]);
  var parser = new Parser(':v(version)h(help)', argv);
  var option;

  while ((option = parser.getopt()) !== undefined) {
    switch (option.option) {
      case 'v':
        console.log(require('./package.json').version);
        return callback();
      case 'h':
        printHelp($0, console.log);
        return callback();
      default:
        console.error('Invalid usage (near option \'%s\'), try `%s --help`.',
          option.optopt, $0);
        return callback(Error('usage'));
    }
  }

  if (parser.optind() !== argv.length) {
    console.error('Invalid usage (extra arguments), try `%s --help`.');
    return callback(Error('usage'));
  }

  doNpmInstall();

  function doNpmInstall() {
    runCommand('npm install --ignore-scripts', function(er, output) {
      if (er) {
        console.error('%s: error during dependency installation', $0);
        reportRunError(er, output);
        return callback(er);
      }

      return doBuildScript();
    });
  }

  function doBuildScript() {
    runCommand('npm run build', function(er, output) {
      if (er) {
        console.error('%s: error in package build script', $0);
        reportRunError(er, output);
        return callback(er);
      }

      return callback();
    });
  }
};
