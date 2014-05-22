var assert = require('assert');
var debug = require('debug')('strong-build');
var Parser = require('posix-getopt').BasicParser;
var path = require('path');
var shell = require('shelljs');
var vasync = require('vasync');

function printHelp($0, prn) {
  prn('usage: %s [options]', $0);
  prn('');
  prn('Build a node application archive.');
  prn('');
  prn('Archives are built without running scripts (by default) to avoid');
  prn('compiling any binary addons. Build and install scripts should be run');
  prn('on the deployment server using `npm rebuild; npm install`.');
  prn('');
  prn('Pack output is a tar file in the format produced by `npm pack` and');
  prn('accepted by `npm install`.');
  prn('');
  prn('Options:');
  prn('  -h,--help       Print this message and exit.');
  prn('  -v,--version    Print version and exit.');
  prn('  -i,--install    Install dependencies (without scripts, by default).');
  prn('  --scripts       If installing, run scripts (to build addons).');
  prn('  -p,--pack       Pack into a publishable archive (with dependencies)');
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
  var parser = new Parser(
    ':v(version)h(help)s(scripts)i(install)p(pack)',
    argv);
  var option;
  var install;
  var scripts;
  var pack;


  while ((option = parser.getopt()) !== undefined) {
    switch (option.option) {
      case 'v':
        console.log(require('./package.json').version);
        return callback();
      case 'h':
        printHelp($0, console.log);
        return callback();
      case 's':
        scripts = true;
        break;
      case 'i':
        install = true;
        break;
      case 'p':
        pack = true;
        break;
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

  if (!install && !pack) {
    install = pack = true;
  }

  var steps = [];

  if (install) {
    steps.push(doNpmInstall);
  }

  if (pack) {
    steps.push(doNpmPack);
  }

  vasync.pipeline({funcs: steps}, callback);

  function doNpmInstall(_, callback) {
    var npmInstall = 'npm install';
    if (!scripts) {
      npmInstall += ' --ignore-scripts';
    }
    runCommand(npmInstall, function(er, output) {
      if (er) {
        console.error('%s: error during dependency installation', $0);
        reportRunError(er, output);
        return callback(er);
      }
      return doBuildScript(_, callback);
    });
  }

  function doBuildScript(_, callback) {
    runCommand('npm run build', function(er, output) {
      if (er) {
        console.error('%s: error in package build script', $0);
        reportRunError(er, output);
      }
      return callback(er);
    });
  }

  function doNpmPack(_, callback) {
    runCommand('npm pack', function(er, output) {
      if (er) {
        console.error('%s: error packing an archive', $0);
        reportRunError(er, output);
      }
      return callback(er);
    });
  }
};
