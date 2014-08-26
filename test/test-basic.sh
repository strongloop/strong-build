#!/bin/bash

set -e

function touchAndCommit() {
  touch $1
  git add $1
  git commit -m "add-$1"
}

function die() {
  echo "not ok # $1"
  exit 1
}

rm -rf _onto
mkdir _onto
cd _onto
git init
touchAndCommit .gitignore
echo '{"name": "build-test-pkg"}' > package.json
touchAndCommit package.json

git checkout -b dst master
touchAndCommit only-on-dst

git checkout -b src master
touchAndCommit only-on-src

git diff --quiet src dst 2> /dev/null && die 'src and dst must be different'

BEFORE_HEAD=`git show-ref -s --head HEAD`
BEFORE_DST=`git show-ref -s --heads dst`

touch build.out
node ../../bin/slb --commit --onto dst

AFTER_DST=`git show-ref -s --heads dst`
AFTER_HEAD=`git show-ref -s --head HEAD`

test "$BEFORE_HEAD" == "$AFTER_HEAD" || die 'slb should not modify HEAD'
test "$BEFORE_DST" != "$AFTER_DST" || die 'slb should modify --onto branch'

git cat-file -e master:build.out 2> /dev/null && die 'build.out should not exist on master'
git cat-file -e dst:build.out || die 'build.out should exist on dst'

BEFORE_HEAD=`git show-ref -s --head HEAD`
BEFORE_DST=`git show-ref -s --heads dst`

node ../../bin/slb --commit --onto dst

AFTER_DST=`git show-ref -s --heads dst`
AFTER_HEAD=`git show-ref -s --head HEAD`

echo "BH $BEFORE_HEAD BD $BEFORE_DST AH $AFTER_HEAD AD $AFTER_DST"
test "$BEFORE_HEAD" == "$AFTER_HEAD" || die 'slb should not modify HEAD'
test "$BEFORE_DST" == "$AFTER_DST" || die 'slb should not modify --onto branch if nothing changed'

BEFORE_HEAD=`git show-ref -s --head HEAD`
BEFORE_DST=`git show-ref -s --heads dst`
BEFORE_SRC=`git show-ref -s --heads src`

touch build2.out
node ../../bin/slb --commit --onto HEAD || die 'Failed to deploy to current branch'

AFTER_SRC=`git show-ref -s --heads src`
AFTER_DST=`git show-ref -s --heads dst`
AFTER_HEAD=`git show-ref -s --head HEAD`

echo "BH $BEFORE_HEAD BD $BEFORE_DST AH $AFTER_HEAD AD $AFTER_DST"
test "$BEFORE_HEAD" != "$AFTER_HEAD" || die 'slb should modify HEAD if used for deploy'
test "$BEFORE_SRC" != "$AFTER_SRC" || die 'slb should modify branch HEAD pointed to'
test "$BEFORE_DST" == "$AFTER_DST" || die 'slb should NOT modify other branches'

git cat-file -e master:build2.out 2> /dev/null && die 'build.out should not exist on master'
git cat-file -e dst:build2.out 2> /dev/null && die 'build.out should not exist on dst'
git cat-file -e src:build2.out || die 'build.out should exist on src'

BEFORE_HEAD=`git show-ref -s --head HEAD`
BEFORE_DST=`git show-ref -s --heads dst`
BEFORE_SRC=`git show-ref -s --heads src`

node ../../bin/slb --commit --onto HEAD || die 'Failed to deploy to current branch'

AFTER_SRC=`git show-ref -s --heads src`
AFTER_DST=`git show-ref -s --heads dst`
AFTER_HEAD=`git show-ref -s --head HEAD`

test "$BEFORE_HEAD" == "$AFTER_HEAD" || die 'slb should modify HEAD if used for deploy'
test "$BEFORE_SRC" == "$AFTER_SRC" || die 'slb should modify branch HEAD pointed to'
test "$BEFORE_DST" == "$AFTER_DST" || die 'slb should NOT modify other branches'
