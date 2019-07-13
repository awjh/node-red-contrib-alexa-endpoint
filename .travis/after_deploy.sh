#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
ME=`basename "$0"`

cd $DIR

VERSION=$(npm --no-git-tag-version version patch)

git add --all
git commit -s -m "Version bump $VERSION"
git push repo master