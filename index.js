var assert = require('assert');
var debug = require('debug')('strong-build');
var fs = require('fs');
var git = require('./lib/git');
var json = require('json-file-plus');
var lodash = require('lodash');
var Parser = require('posix-getopt').BasicParser;
var path = require('path');
var shell = require('shelljs');
var vasync = require('vasync');

function printHelp($0, prn) {
  prn('usage: %s [options]', $0);
  prn('');
  prn('Build a node application package.');
  prn('');
  prn('With no options, the default is to install, bundle, and pack.');
  prn('');
  prn('Options:');
  prn('  -h,--help       Print this message and exit.');
  prn('  -v,--version    Print version and exit.');
  prn('  -onto BRANCH    Merge git HEAD to deployment BRANCH.');
  prn('  -i,--install    Install dependencies (without scripts, by default).');
  prn('  --scripts       If installing, run scripts (to build addons).');
  prn('  -b,--bundle     Modify package to bundle deployment dependencies.');
  prn('  -p,--pack       Pack into a publishable archive (with dependencies).');
  prn('  -c,--commit     Commit build output to current branch.');
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
  var parser = new Parser([
      ':v(version)',
      'h(help)',
      's(scripts)',
      'i(install)',
      'b(bundle)',
      'p(pack)',
      'O:(onto)',
      'c(commit)',
      'N(no-commit)',
    ].join(''),
    argv);
  var option;
  var onto;
  var install;
  var scripts;
  var bundle;
  var pack;
  var commit;

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
      case 'O':
        onto = option.optarg;
        break;
      case 'c':
        commit = true;
        break;
      case 'N':
        commit = false;
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

  // With no actions selected, do everything we can (onto requires an argument,
  // so we can't do it automatically).
  if (!onto && !install && !bundle && !pack && !commit) {
    install = bundle = pack = true;
  }

  var steps = [];

  if (onto) {
    steps.push(doGitOnto);
  }

  if (install) {
    steps.push(doNpmInstall);
  }

  if (bundle) {
    steps.push(doBundle);
  }

  if (pack) {
    steps.push(doNpmPack);
  }

  if (commit) {
    steps.push(doGitCommit);
  }

  vasync.pipeline({funcs: steps}, callback);

  function doGitOnto(_, callback) {
    try {
      var info = git.onto(onto);
      console.log('%s: merged `%s` onto `%s`',
                  $0, info.srcBranch, info.dstBranch);
      return callback();
    } catch(er) {
      console.error('%s: %s', $0, er.message);
      return callback(er);
    }
  }

  function doNpmInstall(_, callback) {
    var npmInstall = 'npm install';
    if (!scripts) {
      npmInstall += ' --ignore-scripts';
    }
    console.log('%s: installing with `%s`...', $0, npmInstall);
    runCommand(npmInstall, function(er, output) {
      if (er) {
        console.error('%s: error during dependency installation', $0);
        reportRunError(er, output);
        return callback(er);
      }
      console.log('%s: installed with `%s`', $0, npmInstall);
      return doBuildScript(_, callback);
    });
  }

  function doBuildScript(_, callback) {
    var npmRun = 'npm run build';
    console.log('%s: running custom build with `%s`...', $0, npmRun);
    runCommand(npmRun, function(er, output) {
      if (er) {
        console.error('%s: error in package build script', $0);
        reportRunError(er, output);
        return callback(er);
      }
      console.log('%s: ran custom build with `%s`', $0, npmRun);
      return callback();
    });
  }

  function doBundle(_, callback) {
    // Build output won't get packed if it is .npmignored (a configuration
    // error, don't .npmignore your build output) or if there is no .npmignore,
    // if it is .gitignored (as they should be). So, create an empty .npmignore
    // if there is a .gitignore but not a .npmignore so build products are
    // packed.
    if (fs.existsSync('.gitignore') && !fs.existsSync('.npmignore')) {
      console.warn('%s: creating an empty .npmignore (please check)', $0);
      fs.close(fs.openSync('.npmignore', 'a'));
    }

    // node_modules is unconditionally ignored by npm pack, the only way to get
    // the dependencies packed is to name them in the package.json's
    // bundledDepenencies.
    var info = require(path.resolve('package.json'));

    var bundled = info.bundleDependencies || info.bundledDependencies;

    debug('found bundled: %j', bundled);

    if (info.bundleDependencies || info.bundledDependencies) {
      // Use package specified dependency bundling
      return callback();
    }

    // Bundle non-dev dependencies. Optional deps may fail to build at deploy
    // time, that's OK, but must be present during packing.  If the user has
    // more specific desires, they can configure the dependencies themselves, or
    // just not run the --bundle action.
    bundled = lodash.union(
      Object.keys(info.dependencies || {}),
      Object.keys(info.optionalDependencies || {})
    ).sort();

    debug('saving bundled: %j', bundled);

    // Re-write package.json, preserving its format if possible.
    json('package.json', function(er, p) {
      if (er) {
        console.error('%s: error reading package.json: %s', $0, er.message);
        return callback(er);
      }

      p.data.bundleDependencies = bundled;

      p.save(function(er) {
        if (er) {
          console.error('%s: error writing package.json: %s', $0, er.message);
          return callback(er);
        }
        console.log('%s: saved bundled dependencies in package.json', $0);
        return callback();
      });
    });
  }

  function doNpmPack(_, callback) {
    var npmPack = 'npm --quiet pack';
    console.log('%s: packing with `%s` ...', $0, npmPack);
    runCommand(npmPack, function(er, output) {
      if (er) {
        console.error('%s: error packing an archive', $0);
        reportRunError(er, output);
        return callback(er);
      }

      // npm pack output is a single line with the pack file name
      var src = output.split('\n')[0];
      var dst = path.join('..', src);

      shell.mv('-f', src, dst);

      console.log('%s: packed into `%s` with `%s`', $0, dst, npmPack);

      return callback();
    });
  }

  function doGitCommit(_, callback) {
    try {
      var info = git.commitAll();
      console.log('%s: committed build products onto `%s`', $0, info.branch);
      return callback();
    } catch(er) {
      console.error('%s: %s', $0, er.message);
      return callback(er);
    }
  }
};
