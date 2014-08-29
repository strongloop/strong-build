# strong-build

Build a node application package, preparing it for production.

## Packaging

Best practice when preparing a node (or any) application for production is to
bundle its dependencies so that there are no deploy-time dependencies on
external services.  Not doing so for a node applications leads to deploy time
dependencies on external services such as npmjs.org, with possibly catastrophic
results.

The build process is implemented as four commands:

- install: the core of the build, it installs dependencies, runs custom
  build steps, and prunes development dependencies
- bundle: modify the npm `package.json` and `.npmignore` configuration files
  so dependencies will be packed
- pack: create an npm package of the build
- commit: commit the build onto a git branch

In a git repository, it is assumed git will be used to deploy, and the
default commands are `--install --commit`.

Otherwise, it is assumed an npm package will be deployed, and the default
commands are `--bundle --install --pack`.

Both npm packages and git branches can be deployed to the StrongLoop [process
manager](http://github.com/strongloop/strong-pm) using the StrongLoop
[deploy](http://github.com/strongloop/strong-deploy) tool.

Specifying any command disables the default, and allows any mix of commands
to be run, either singly, or all at once.

Also, note that *builds should be done in a clean working copy*. You don't build
deployment artifacts out of a possibly dirty working copy if you want
reproducible builds. You can clean your working copy using `git clean -x -d
-f`. This is too destructive for the build tool to do, but doing a build in an
unclean working repository may trigger an error in a future version of the tool.


## install command

install automates the common work flow for building application dependencies:

- `npm install --ignore-scripts`: install node dependencies without running
  scripts. Scripts can be run optionally with `--scripts`.
- `npm run build`: custom build steps such as `grunt build` or `bower` can be
  specified in the package's `scripts.build` property, since front-end code
  served by node commonly requires some amount of preparation.
- `npm prune --production`: remove development-only tools (such as bower, or
  grunt) that may have been required by the package's build scripts, but should
  not be deployed

Note that compilation and install scripts should be run on the deployment server
using:

- `npm rebuild`: compile add-ons for current system
- `npm install`: run any install scripts (not typical, but if they exist
  they may be required to prepare the application for running)

If builds are done on the same system architecture as the deploy, it is possible
to compile and package the add-ons, and avoid the presence of a compiler on the
deployment system. This is recommended when possible, but is not the default
behaviour of strong-build.


## bundle command

Bundling configures the package.json and .npmignore so deployment (not
development) dependencies as well as any 'build' script output will not be
ignored by `npm pack`.

This is unnecessary when using git to deploy, but mandatory when creating npm
packages!

### package.bundleDependencies

Bundling requires that the package's bundleDependencies is configured to include
all non-development dependencies, including optional dependencies, which are
often overlooked.

Its important that you remember to add every new production dependency to the
bundleDependencies property, if you don't, npm will try and install them after
deploy, creating unexpected and fragile dependencies on npmjs.org.

Since keeping this up-to-date manually is certain to go wrong, we recommend
allowing the bundle command to do this for you. However, the
bundleDependencies property is not modified if present, so you are free to
maintain it yourself, if you wish (or to not just the bundle command).

### .npmignore

Setting bundle dependencies is insufficient to get the output of build tools.

Both build output and project ephemera such as test output is usually ignored
using `.gitignore`, as it should be. However, if npm does not find a
`.npmignore` configuration file, it uses `.gitignore` as a fallback.  This means
that if you have custom build output, such as minimized JavaScript, it will be
treated as project ephemera, and not be packed by npm.

The bundle command will create an *empty* `.npmignore` file if there is a
`.gitignore` file but there is not `.npmignore` file. This will work for clean
repositories, but if you have any project ephemera, they will get packed.

We recommend you write and maintain you own `.npmignore` file unless your build
process guarantees a clean working repository.


## pack command

Pack output is a tar file in the format produced by `npm pack` and
accepted by `npm install`.

The pack file is placed in the parent directory of the application being packed,
to avoid the pack file itself getting packed by future builds, and to allow the
working repository to be cleaned.

If a `.npmignore` file was created by the bundle command, check the pack file
contents carefully to ensure build products are packed, but project ephemera are
not.


## commit command

Committing build products into git provides the most robust tracking and
storage, including versioning of deployments.

This is often done by committing both build products and dependencies
(`node_modules`) into git where they pollute the source branches, create massive
git commits and huge churn on the development branches and repositories.

The commit command does not do this.

It commits an exact replica of current branch source and build products onto a
deployment branch. After the commit, the deployment branch tip shows as a merge
of the deployment and source branches.  This allows a complete history of
deployment builds to be kept in git, but separated from the development
branches. Deployment branches can be pushed to the same repository as the
development branches, or not.

Note that branches prepared like this can also be pushed to platforms such
as OpenShift and Heroku.

The default name of the deployment branch is "deploy", but is configurable with
the `--onto BRANCH` modifier to the commit command.


## Usage

```
usage: slc build [options]
usage: slb [options]

Build a node application package.

With no options, the default depends on whether a git repository is
detected or not.

If a git repository is detected, the default is to install and commit
the build results to the "deploy" branch, which will be created if it
does not already exist.

If no git repository is detected, the default is to bundle, install,
and pack the build results into a <package-name>-<version>.tgz file.

Options:
  -h,--help       Print this message and exit.
  -v,--version    Print version and exit.
  -i,--install    Install dependencies (without scripts, by default).
  --scripts       If installing, run scripts (to build addons).
  -b,--bundle     Modify package to bundle deployment dependencies.
  -p,--pack       Pack into a publishable archive (with dependencies).

Git specific options:
  -c,--commit     Commit build output (branch specified by --onto).
  --onto BRANCH   Branch to commit build results to, creating if
                  necessary. ("deploy", by default).
```
