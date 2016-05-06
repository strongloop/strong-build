// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-build
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var debug = require('debug')('strong-build');
var lodash = require('lodash');
var path = require('path');
var shell = require('shelljs');
var util = require('util');

function fmt() {
  return util.format.apply(util, arguments);
}

function execSync(cmd, error, noOutput) {
  debug('exec `%s`: ...', cmd);

  if (gitDir(true))
    process.env.GIT_INDEX_FILE = path.join(gitDir(), 'strong-build-index');

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

function resolveBranch(name) {
  // Resolve symbolic name "HEAD" if given
  if (name === 'HEAD') {
    name = shell.exec('git symbolic-ref HEAD', {silent: true})
                .output
                .trim()
                .replace(/^refs\/heads\//, '');
  }

  // $ git show-ref --heads master
  // 5855ad5bf1d38fc94059a1ef917c61866ca4d3d4 refs/heads/master
  var showRef = fmt('git show-ref --heads "%s"', name);
  var info = shell.exec(showRef, {silent: true})
                  .output
                  .trim()
                  .split(' ');

  return {
    name: name,
    sha: info[0],
    ref: info[1]
  };
}

exports.isGit = function gitIsGit() {
  return !!gitDir();
};

var gitDir = exports.gitDir = lodash.memoize(function gitDir() {
  var exec = shell.exec('git rev-parse --git-dir', {silent: true});
  return exec.code === 0 && exec.output.trim();
});

exports.ensureBranch = function ensureBranch(name) {
  var info = resolveBranch(name);
  if (!info.ref)
    execSync(
      fmt('git branch "%s"', name),
      fmt('Failed to create branch "%s"', name)
    );
};

exports.syncBranch = function gitSyncBranch(gitDstBranch) {
  // Get name of current branch, and the tree SHA of its HEAD commit
  var src = resolveBranch('HEAD');
  var dst = resolveBranch(gitDstBranch);

  debug('syncing dst(%o) with src(%o)', src, dst);
  var mergeBaseCmd = fmt('git merge-base "%s" "%s"', src.sha, dst.sha);
  var mergeBase = shell.exec(mergeBaseCmd, {silent: true})
                       .output
                       .trim();

  if (mergeBase === src.sha) {
    return {};
  }

  var gitSrcTreeSha = execSync(
    'git log -1 --pretty=format:"%t" HEAD',
    'Failed to parse branch `HEAD`, is this a git repository?'
  );

  // Commit the source tree to the head of the destination branch, and update
  // the destination branch ref.
  var message = fmt('Commit tree of \'%s\' onto \'%s\'', src.ref, gitDstBranch);
  var commitSha = execSync(
    fmt('git commit-tree -p "%s" -p "%s" -m "%s" %s',
        dst.ref, src.ref, message, gitSrcTreeSha),
    fmt('Failed to commit `%s` onto `%s`', src.ref, gitDstBranch)
  );

  execSync(
    fmt('git update-ref "%s" %s', dst.ref, commitSha),
    fmt('Failed to merge `%s` onto `%s`', src.ref, gitDstBranch)
  );

  return {
    dstBranch: gitDstBranch,
    srcBranch: src.ref,
    srcTreeSha: gitSrcTreeSha,
    commitSha: commitSha,
  };
};

exports.commitAll = function gitCommitAll(gitDstBranch) {
  execSync(
    fmt('git add --force --all .'),
    fmt('Failed to add build products')
  );
  var treeSha = execSync(
    fmt('git write-tree'),
    fmt('Failed to stage build products for commit')
  );
  var dst = resolveBranch(gitDstBranch);
  var commitSha = execSync(
    fmt('git commit-tree -p "%s" -m "Commit build products" %s',
        dst.ref, treeSha),
    fmt('Failed to create build products commit for `%s`', gitDstBranch),
    true
  );

  var diff = shell.exec(fmt('git diff --quiet "%s" "%s"', commitSha, dst.ref),
                        {silent: true});
  if (diff.code === 0)
    return {};

  execSync(
    fmt('git update-ref "%s" %s', dst.ref, commitSha),
    fmt('Failed to commit build products to `%s`', gitDstBranch)
  );

  return {
    branch: gitDstBranch,
    dstRef: dst.ref,
    tree: treeSha,
    commit: commitSha,
  };
};
