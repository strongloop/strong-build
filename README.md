# strong-build

usage: `slb [options]`

Build a node application package.

With no options, the default is to install, bundle, and pack.

When using git, the current branch can be committed onto a deployment
branch before the build. This allows the build products to be
committed and synchronized with a source-only branch.

Packages are built without running scripts (by default, see --scripts)
to avoid compiling any binary addons. Compilation and install scripts
should be run on the deployment server using:

    npm rebuild
    npm install

Custom build steps, such as `grunt build`, can be specified as a
'build' script in the package.json's `scripts` property and will
be run after installing dependencies.

Bundling configures the package.json and .npmignore so deployment (not
development) dependencies as well as any 'build' script output will
not be ignored by `npm pack`.

Pack output is a tar file in the format produced by `npm pack` and
accepted by `npm install`.

Options:
* -h,--help       Print this message and exit.
* -v,--version    Print version and exit.
* -onto BRANCH    Merge git HEAD to deployment BRANCH.
* -i,--install    Install dependencies (without scripts, by default).
* --scripts       If installing, run scripts (to build addons).
* -b,--bundle     Modify package to bundle deployment dependencies.
* -p,--pack       Pack into a publishable archive (with dependencies).
