# strong-build

Build a node application package, preparing it for production.

## Packaging

Best practice when preparing a node (or any) application for production is to
bundle its dependencies so that there are no deploy-time dependencies on
external services.  Not doing so for a node applications leads to deploy time
dependencies on external servics such as npmjs.org, with possibly catastrophic
results.

For node, this means packages are built without running scripts to avoid
compiling any binary addons. strong-build automates the common work flow:

- `npm install --ignore-scripts`: install node dependencies
- `npm run build`: custom build steps such as `grunt build` or `bower`
  (front-end code served by node commonly requires some amount of preparation)
- ... bundling dependencies...: usually done through manual maintanance of the
  package's bundleDependencies property and .npmignore file, but strong-build
  can automate the common cases.
- `npm pack`: produce a deployable tgz package

Compilation and install scripts should be run on the deployment server using:

- `npm rebuild`: compile addons for current system
- `npm install`: run any install scripts (not typical, but if they exist
  they may be required to prepare the application for running)

If builds are done on the same system architecture as the deploy, it is possible
to compile and package the addons, and avoid the presence of a compiler on the
deployment system. This is recommended when possible, but is not the default
behaviour of strong-build.

Bundling configures the package.json and .npmignore so deployment (not
development) dependencies as well as any 'build' script output will
not be ignored by `npm pack`. Note that unlike many similar tools that ignore
the `optionalDependencies`, this tool bundles them. If it did not, npm would
try and install them after deploy, which is exactly what we don't want.

Pack output is a tar file in the format produced by `npm pack` and
accepted by `npm install`.

If an .npmignore is created, check it carefully to ensure build products are
packed, but editor and test ephemera are not. When builds are done in clean
working directory (recommended) it should not be necessary to manually create an
`.npmignore` file, but doing so may be more robust.

## GIT Specifics

When using a SaaS such as OpenShift or Heroku, the build products should be
committed into git for reliable deployment. Even when not using a SaaS,
committing the build into git allows tracking of deployment states.

This is often done by committing build products and `node_modules` into
git where they pollute the source branches, create massive git commits and
generally nasty git history.

There is another way, commit an exact replica of the HEAD of the current branch
onto a deployment branch (of your choosing), and then commit the build products
onto only the deployment branch. After the commit, the deployment branch tip
shows as a merge of deployment and source, but will not contain any previous
state of the deployment branch, but still leave the history of the deployment
branch intact. This allows a complete history of deployment builds to be kept in
git, but seperated from the development branches. Deployment branches can be
pushed to the same repository as the development branches, or not.

The git manipulations are supported by `--onto BRANCH` to commit the current
HEAD onto BRANCH, and by `--commit` to add and commit all build products.

## Usage

```
usage: slb [options]

Build a node application package.

With no options, the default is to install, bundle, and pack. This
would be typical for an `npm pack` based deployment.

When committing build products to git, a more typical sequence would
be onto, install, commit.

Options:
  -h,--help       Print this message and exit.
  -v,--version    Print version and exit.
  -i,--install    Install dependencies (without scripts, by default).
  --scripts       If installing, run scripts (to build addons).
  -b,--bundle     Modify package to bundle deployment dependencies.
  -p,--pack       Pack into a publishable archive (with dependencies).

Git specific options:
  -onto BRANCH    Merge current HEAD to BRANCH, and checkout BRANCH.
  -c,--commit     Commit build output to current branch.
```
