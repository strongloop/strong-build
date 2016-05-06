2016-05-06, Version 2.1.2
=========================

 * update copyright notices and license (Ryan Graham)


2016-04-11, Version 2.1.1
=========================

 * fix failing test on npm3 (Ryan Graham)


2015-12-21, Version 2.1.0
=========================

 * remove support for --bundle flag (Ryan Graham)

 * Refer to licenses with a link (Sam Roberts)


2015-10-01, Version 2.0.6
=========================

 * usage: document -s alias for --scripts (Ryan Graham)

 * lint: add spaces after keywords (Ryan Graham)

 * Use strongloop conventions for licensing (Sam Roberts)


2015-09-16, Version 2.0.5
=========================

 * switch to iconv for binary tests (Ryan Graham)


2015-08-06, Version 2.0.4
=========================

 * usage: clarify relationship between pack/bundle (Sam Roberts)

 * test: shelljs exec silent is required under io.js (Sam Roberts)

 * lintpocalypse (Ryan Graham)

 * package: add eslint and rules (Ryan Graham)

 * fix undefined test() error (Ryan Graham)

 * test: regression test for zero dependency apps (Ryan Graham)

 * build: detect/handle apps with no dependencies (Ryan Graham)


2015-07-07, Version 2.0.3
=========================

 * Construct packfile name from package (Sam Roberts)


2015-05-21, Version 2.0.2
=========================

 * Ignore test output (Sam Roberts)


2015-05-13, Version 2.0.1
=========================

 * test: flush disk after building test app (Ryan Graham)

 * test: improve debugability of test-script-only (Ryan Graham)

 * fix callback exception catching (Ryan Graham)

 * deps: upgrade tar (Ryan Graham)

 * deps: upgrade shelljs (Ryan Graham)

 * deps: upgrade lodash (Ryan Graham)

 * deps: upgrade json-file-plus (Ryan Graham)

 * deps: upgrade tap to 0.7 (Ryan Graham)

 * deps: alphabetize deps (Ryan Graham)


2015-04-30, Version 2.0.0
=========================

 * Fix #23, rename of bin/slb to bin/sl-build (Sam Roberts)

 * Add --npm and --git options (Sam Roberts)

 * Update README for strong-pm.io (Sam Roberts)

 * Factor usage message into sl-build.txt. (Sam Roberts)

 * Rename sl-build for consistency (Sam Roberts)


2015-01-12, Version 1.0.3
=========================

 * test: remove loopback-connector-oracle from tests (Ryan Graham)

 * Fix bad CLA URL in CONTRIBUTING.md (Ryan Graham)


2014-12-09, Version 1.0.2
=========================

 * test: use strong-fork-syslog for tests (Ryan Graham)

 * internal: add info for sync branch debugging (Ryan Graham)

 * Skip 'npm run build' if no build script (Ryan Graham)

 * package: use debug v2.x in all strongloop deps (Sam Roberts)


2014-11-03, Version 1.0.1
=========================

 * Ensure default steps run when using --script only (Krishna Raman)

 * git: don't rely on git-symbolic-ref --short (Ryan Graham)

 * Ignore .(git|npm)ignore when building packs (Krishna Raman)


2014-10-02, Version 1.0.0
=========================

 * Update contribution guidelines (Ryan Graham)


2014-09-02, Version 0.2.1
=========================

 * package: update json-file-plus to avoid deprecated (Sam Roberts)

 * package: update README (Sam Roberts)

 * package: add keywords for npm search (Sam Roberts)

 * package: rename changelog and fix date format (Sam Roberts)


2014-08-26, Version 0.2.0
=========================

 * test: replace slc dep with static fixture (Ryan Graham)

 * test: validate test setup (Ryan Graham)

 * test: ensure build can be run on HEAD (Ryan Graham)

 * Refactor common git ref lookup into utility (Ryan Graham)

 * Don't commit build results if unchanged (Ryan Graham)

 * Only merge HEAD into deploy if necessary (Ryan Graham)

 * Make --onto a modifier for --commit (Ryan Graham)

 * git: Override GIT_INDEX_FILE for all git commands (Ryan Graham)

 * Ensure create --onto branch if it doesn't exist (Ryan Graham)

 * Use git detection to inform defaults (Ryan Graham)

 * test: sls-sample-app loopback-example-app rename (Ryan Graham)

 * test: replace onto tests with shell script (Ryan Graham)

 * test: support mix of JS and shell based tests (Ryan Graham)

 * onto: fix typo in usage message (Sam Roberts)

 * Update package license to match LICENSE.md (Sam Roberts)


2014-07-22, Version 0.1.2
=========================

 * Allow building onto an identical branch (Sam Roberts)


2014-07-21, Version 0.1.1
=========================

 * docs: clarify typical git workflow (Sam Roberts)


2014-06-19, Version 0.1.0
=========================



2014-06-19, Version 0.0.1
=========================

 * docs: update README with usage (Sam Roberts)

 * usage: fix missing command name in usage message (Sam Roberts)

 * log: show git commands during --onto and --commit (Sam Roberts)

 * log: show commands during --install,bundle,pack (Sam Roberts)

 * install: prune dev dependencies after build script (Sam Roberts)

 * pack: remove npm debug messages from output (Sam Roberts)

 * bundle: accept packages with no dependencies (Sam Roberts)

 * log: log when beginning a long-running command (Sam Roberts)

 * doc: update README and other docs pre-publish (Sam Roberts)

 * readme: update with latest usage (Sam Roberts)

 * log: ensure each action logs on complete (Sam Roberts)

 * bundle,pack: log the actions taken (Sam Roberts)

 * git: remove unused $0 argument to git.onto() (Sam Roberts)

 * commit: commit build products into git (Sam Roberts)

 * bundle: bundle only dependencies and optional deps (Sam Roberts)

 * bundle: warn on problematic or incomplete config (Sam Roberts)

 * onto: commit source tree onto a deploy branch (Sam Roberts)

 * doc: add README.md and update --help output (Sam Roberts)

 * pack: place archive in parent directory (Sam Roberts)

 * test: use strong-cli as a dev dependency (Sam Roberts)

 * Implement --bundle, so dependencies are packed (Sam Roberts)

 * Implement --pack, to create an archive (Sam Roberts)

 * Implement --scripts, to build binary addons (Sam Roberts)

 * Refactor build test setup so it can be reused (Sam Roberts)

 * Use option parser, and test option parsing (Sam Roberts)

 * Implement running of custom package build script (Sam Roberts)

 * Implement usage and version options (Sam Roberts)

 * Implement npm install without build scripts (Sam Roberts)

 * Add tap test script (Sam Roberts)

 * Add package.json and slb stub (Sam Roberts)

 * License and contribution agreement (Sam Roberts)


2014-05-20, Version INITIAL
===========================

 * First release!
