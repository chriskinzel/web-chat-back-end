#!/usr/bin/env bash

branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')
target='install'

git stash store "$(git stash create)" > /dev/null 2>&1
doPop=$?

(git branch -D "$target"; git checkout -b "$target") > /dev/null 2>&1 && rm -rf bin/* && npm run build && cp .npmignore .gitignore && git rm -r --cached . > /dev/null 2>&1 && echo 'Pushing files...' && git add . > /dev/null 2>&1 && git commit -m 'publish' > /dev/null 2>&1 && git push -f origin "$target" && echo -e '\nPublish complete!'

git checkout "$branch" > /dev/null 2>&1
git branch -D "$target" > /dev/null 2>&1

if [ $doPop -eq 0 ]
then
  git stash pop > /dev/null 2>&1
fi
