var assert = require('assert');
var debug = require('debug')('strong-build');
var fs = require('fs');
var Parser = require('posix-getopt').BasicParser;
var path = require('path');
var json = require('json-file-plus');
var lodash = require('lodash');
var shell = require('shelljs');
var vasync = require('vasync');

function printHelp($0, prn) {
  prn('usage: %s [options]', $0);
  prn('');
  prn('Build a node application package.');
  prn('');
  prn('Packages are built without running scripts (by default, see --scripts)');
  prn('to avoid compiling any binary addons. Compilation and install scripts');
  prn('should be run on the deployment server using:');
  prn('');
  prn('    npm rebuild');
  prn('    npm install');
  prn('');
  prn('Custom build steps, such as `grunt build`, can be specified as a');
  prn('\'build\' script in the package.json\'s `scripts` property and will');
  prn('be run after installing dependencies.');
  prn('');
  prn('Bundling configures the package.json and .npmignore so deployment (not');
  prn('development) dependencies as well as any \'build\' script output will');
  prn('not be ignored by `npm pack`.');
  prn('');
  prn('Pack output is a tar file in the format produced by `npm pack` and');
  prn('accepted by `npm install`.');
  prn('');
  prn('Options:');
  prn('  -h,--help       Print this message and exit.');
  prn('  -v,--version    Print version and exit.');
  prn('  -i,--install    Install dependencies (without scripts, by default).');
  prn('  --scripts       If installing, run scripts (to build addons).');
  prn('  -b,--bundle     Modify package to bundle deployment dependencies.');
  prn('  -p,--pack       Pack into a publishable archive (with dependencies).');
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
    ':v(version)h(help)s(scripts)i(install)b(bundle)p(pack)',
    argv);
  var option;
  var install;
  var scripts;
  var bundle;
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
      case 'b':
        bundle = true;
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

  if (!install && !bundle && !pack) {
    install = bundle = pack = true;
  }

  var steps = [];

  if (install) {
    steps.push(doNpmInstall);
  }

  if (bundle) {
    steps.push(doBundle);
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

  function doBundle(_, callback) {
    // Build output won't get packed if it is .npmignored (a configuration
    // error, don't .npmignore your build output) or if there is no .npmignore,
    // if it is .gitignored (as they should be). So, create an empty .npmignore
    // if there is a .gitignore but not a .npmignore so build products are
    // packed.
    if (fs.existsSync('.gitignore')) {
      fs.close(fs.openSync('.npmignore', 'a'));
    }

    // node_modules is unconditionally ignored by npm pack, the only way to get
    // the dependencies packed is to name them in the package.json's
    // bundledDepenencies.
    var deps = fs.readdirSync('node_modules').filter(function(file) {
      // Only directories containing a package.json are packages.
      return shell.test(
        '-f',
        path.join('node_modules', file, 'package.json')
      );
    });

    var info = require(path.resolve('package.json'));
    var dev = Object.keys(info.devDependencies || {});

    // Remove dev dependencies, bundle any others, including manually
    // installed, deps comitted into version control, optional, etc.
    var bundle = lodash.difference(deps, dev);

    // Two names are allowed for this key... use 'bundledDependencies' unless
    // package is already using the other name.
    var key = info.bundleDependencies ?
      'bundleDependencies' :
      'bundledDependencies';

    bundle = lodash.uniq(bundle.concat(
      info.bundleDependencies || info.bundledDependencies || []
    ));

    // Re-write package.json, preserving its format if possible.
    json('package.json', function(er, p) {
      if (er) {
        console.error('%s: error reading package.json: %s', $0, er.message);
        return callback(er);
      }

      p.data[key] = bundle;

      p.save(function(er) {
        if (er) {
          console.error('%s: error writing package.json: %s', $0, er.message);
        }
        return callback(er);
      });
    });
  }

  function doNpmPack(_, callback) {
    runCommand('npm pack', function(er, output) {
      if (er) {
        console.error('%s: error packing an archive', $0);
        reportRunError(er, output);
        return callback(er);
      }

      // npm pack output is a single line with the pack file name
      var src = output.split('\n')[0];
      var dst = path.join('..', src);

      shell.mv('-f', src, dst);

      return callback();
    });
  }
};
