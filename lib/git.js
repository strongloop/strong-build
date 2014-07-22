var assert = require('assert');
var debug = require('debug')('strong-build');
var fs = require('fs');
var lodash = require('lodash');
var path = require('path');
var shell = require('shelljs');
var util = require('util');

function fmt() {
  return util.format.apply(util, arguments);
}

function execSync(cmd, error, noOutput) {
  debug('exec `%s`: ...', cmd);

  var exec = shell.exec(cmd, {silent: true});

  exec.output = exec.output.trim();

  debug('exec `%s`: (code %s) %s', cmd, exec.code, exec.output);

  if (exec.code !== 0) {
    var output = exec.output.replace('fatal: ', '');
    console.log('Error on `%s`:\n  %s', cmd, output);
    throw Error(error);
  }

  console.log('Running `%s`', cmd);

  // git on success may still write messages to stderr, and shelljs combines
  // stdout and stderr (sucky). This effect commit-tree, for example, when dest
  // branch and HEAD are the same, the first output line is 'error: duplicate
  // parent ... ignored\n', but the command succeeds, and the SHA of the tree is
  // the next line. So, remove any error lines from output if the command
  // exited with success.
  if (!noOutput && exec.output.length > 0) {
    exec.output = exec.output.replace(/error: .*\n/, '', 'g');

    console.log('  => %s', exec.output);
  }

  return exec.output;
}

exports.isGit = function gitIsGit() {
  try {
    execSync('git symbolic-ref --short HEAD', '(do not care)');
    return true;
  } catch(er) {
    return false;
  }
}

exports.onto = function gitOnto(gitDstBranch) {
  // Get name of current branch, and the tree SHA of its HEAD commit
  var gitSrcBranch = execSync(
    'git symbolic-ref --short HEAD',
    'Failed to parse branch `HEAD`, is this a git repository?'
  );

  var gitSrcTreeSha = execSync(
    'git log -1 --pretty=format:"%t" HEAD',
    'Failed to parse branch `HEAD`, is this a git repository?'
  );

  // Get ref name of destination branch, to validate it exists, and because
  // we will use it later.
  var dstRefInfo = execSync(
    fmt('git show-ref --heads --abbrev "%s"', gitDstBranch),
    fmt('Failed to parse branch `%s`, does it exist?', gitDstBranch)
  );
  var dstRef = dstRefInfo.split(' ')[1];

  // Commit the source tree to the head of the destination branch, and update
  // the destination branch ref.
  var message = fmt('Commit tree of \'%s\' onto \'%s\'', gitSrcBranch, gitDstBranch);
  var commitSha = execSync(
    fmt('git commit-tree -p HEAD -p "%s" -m "%s" %s',
        gitDstBranch, message, gitSrcTreeSha),
    fmt('Failed to commit `%s` onto `%s`', gitSrcBranch, gitDstBranch)
  );

  execSync(
    fmt('git update-ref "%s" %s', dstRef, commitSha),
    fmt('Failed to merge `%s` onto `%s`', gitSrcBranch, gitDstBranch)
  );

  // Checkout the destination branch so that we are ready to build
  execSync(
    fmt('git checkout "%s"', gitDstBranch),
    fmt('Failed to checkout `%s`', gitDstBranch)
  );

  return {
    dstBranch: gitDstBranch,
    srcBranch: gitSrcBranch,
    srcTreeSha: gitSrcTreeSha,
    commitSha: commitSha,
  };
}

exports.commitAll = function gitCommitAll() {
  var gitSrcBranch = execSync(
    'git symbolic-ref --short HEAD',
    'Failed to parse branch `HEAD`, is this a git repository?'
  );
  execSync(
    fmt('git add --force --all .'),
    fmt('Failed to add build products to `%s`', gitSrcBranch)
  );
  execSync(
    fmt('git commit -m "Commit build products"'),
    fmt('Failed to commit build products to `%s`', gitSrcBranch),
    true
  );

  return {
    branch: gitSrcBranch,
  };
}
