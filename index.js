// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-build
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var Parser = require('posix-getopt').BasicParser;
var debug = require('debug')('strong-build');
var fmt = require('util').format;
var fs = require('fs');
var git = require('./lib/git');
var path = require('path');
var pump = require('pump');
var shell = require('shelljs');
var strongPack = require('strong-pack');
var vasync = require('vasync');
var zlib = require('zlib');

function printHelp($0, prn) {
  var USAGE = fs.readFileSync(require.resolve('./sl-build.txt'), 'utf-8')
    .replace(/%MAIN%/g, $0)
    .trim();

  prn(USAGE);
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

function runWait(cmd, callback) {
  console.log('Running `%s`', cmd);
  runCommand(cmd, function(er, output) {
    if (er) {
      console.error('Error on `%s`:', cmd);
      reportRunError(er, output);
      return callback(er);
    }
    return callback(null, output);
  });
}

function runStep(cmd) {
  return function(_, callback) {
    runWait(cmd, function(er) {
      return callback(er); // do not return output of runWait()
    });
  };
}

function reportRunError(er, output) {
  if (!er) return;

  console.error('Failed to run `%s`:', er.message);
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
      'n(npm)',
      'g(git)',
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
  var onto = 'deploy';
  var install;
  var scripts;
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
      case 'n':
        install = true;
        commit = false;
        pack = true;
        break;
      case 'g':
        install = true;
        commit = true;
        pack = false;
        break;
      case 's':
        scripts = true;
        break;
      case 'i':
        install = true;
        break;
      case 'b':
        console.error('Warning: the --bundle option now does nothing and ' +
                      'should not be used');
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
    console.error('Invalid usage (extra arguments), try `%s --help`.', $0);
    return callback(Error('usage'));
  }

  // With no actions selected, do everything we can (onto requires an argument,
  // so we can't do it automatically).
  if (!(install || pack || commit)) {
    install = true;
    if (git.isGit()) {
      commit = true;
      pack = false;
    } else {
      commit = false;
      pack = true;
    }
  }

  if (commit && !git.isGit()) {
    console.error('Cannot perform commit on non-git working directory');
    return callback(Error('usage'));
  }

  var steps = [];

  if (commit) {
    steps.push(doEnsureGitBranch);
    steps.push(doGitSyncBranch);
  }

  if (install) {
    steps.push(doNpmInstall);
  }

  if (pack) {
    steps.push(doNpmPack);
  }

  if (commit) {
    steps.push(doGitCommit);
  }

  vasync.pipeline({funcs: steps}, callback);

  function doEnsureGitBranch(_, callback) {
    try {
      git.ensureBranch(onto);
    } catch (er) {
      console.error('%s', er.message);
      return callback(er);
    }
    return callback();
  }

  function doGitSyncBranch(_, callback) {
    try {
      var info = git.syncBranch(onto);
      if (info.srcBranch && info.dstBranch) {
        console.log('Merged source tree of `%s` onto `%s`',
          info.srcBranch, info.dstBranch);
      } else {
        console.log('Not merging HEAD into `%s`, already up to date.', onto);
      }
    } catch (er) {
      console.error('%s', er.message);
      return callback(er);
    }
    return callback();
  }

  function doNpmInstall(_, callback) {
    var pkg = require(path.resolve('package.json'));
    var install = 'npm install';
    if (!scripts) {
      install += ' --ignore-scripts';
    }
    var steps = [runStep(install)];
    if (pkg.scripts && pkg.scripts.build) {
      steps.push(runStep('npm run build'));
    }
    steps.push(runStep('npm prune --production'));
    vasync.pipeline({funcs: steps}, function(er) {
      return callback(er);
    });
  }

  function doNpmPack(_, callback) {
    var pkg = JSON.parse(fs.readFileSync('package.json'));
    var tgzName = fmt('%s-%s.tgz', pkg.name, pkg.version);
    var dst = path.join('..', tgzName);
    var tarStream = strongPack(process.cwd());
    var dstFile = fs.createWriteStream(dst, 'binary');
    var gz = zlib.createGzip();
    console.log('Packing application in to %s', dst);
    pump(tarStream, gz, dstFile, callback);
  }

  function doGitCommit(_, callback) {
    try {
      var info = git.commitAll(onto);
      if (info.branch) {
        console.log('Committed build products onto `%s`', info.branch);
      } else {
        console.log('Build products already up to date on `%s`', onto);
      }
    } catch (er) {
      console.error('%s', er.message);
      return callback(er);
    }
    return callback();
  }
};
