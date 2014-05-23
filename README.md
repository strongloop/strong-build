# strong-build

usage: `slb [options]`

Build a node application package.

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
* -i,--install    Install dependencies (without scripts, by default).
* --scripts       If installing, run scripts (to build addons).
* -b,--bundle     Modify package to bundle deployment dependencies.
* -p,--pack       Pack into a publishable archive (with dependencies).
