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

function execSync(cmd, error) {
  var exec = shell.exec(cmd, {silent: true});

  debug('exec `%s`: ...', cmd);

  exec.output = exec.output.trim();

  debug('exec `%s`: (code %s) %s', cmd, exec.code, exec.output);

  if (exec.code !== 0) {
    throw Error(error);
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
    'failed to parse branch `HEAD`, is this a git repository?'
  );

  var gitSrcTreeSha = execSync(
    'git log -1 --pretty=format:"%t" HEAD',
    'failed to parse branch `HEAD`, is this a git repository?'
  );

  // Get ref name of destination branch, to validate it exists, and because
  // we will use it later.
  var dstRefInfo = execSync(
    fmt('git show-ref --heads --abbrev "%s"', gitDstBranch),
    fmt('failed to parse branch `%s`, does it exist?', gitDstBranch)
  );
  var dstRef = dstRefInfo.split(' ')[1];

  // Commit the source tree to the head of the destination branch, and update
  // the destination branch ref.
  var message = fmt('Commit branch `%s` onto `%s`', gitSrcBranch, gitDstBranch);
  var commitSha = execSync(
    fmt('git commit-tree -p HEAD -p "%s" -m \'%s\' %s',
        gitDstBranch, message, gitSrcTreeSha),
    fmt('failed to commit `%s` onto `%s`', gitSrcBranch, gitDstBranch)
  );

  execSync(
    fmt('git update-ref "%s" %s', dstRef, commitSha),
    fmt('failed to merge `%s` onto `%s`', gitSrcBranch, gitDstBranch)
  );

  // Checkout the destination branch so that we are ready to build
  execSync(
    fmt('git checkout "%s"', gitDstBranch),
    fmt('failed to checkout `%s`', gitDstBranch)
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
    'failed to parse branch `HEAD`, is this a git repository?'
  );
  execSync(
    fmt('git add --force --all .'),
    fmt('failed to add build products to `%s`', gitSrcBranch)
  );
  execSync(
    fmt('git commit -m "Commit build products"'),
    fmt('failed to commit build products to `%s`', gitSrcBranch)
  );

  return {
    branch: gitSrcBranch,
  };
}
