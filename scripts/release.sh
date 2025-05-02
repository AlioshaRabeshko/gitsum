if [[ -n $(git status -s) ]]; then
  echo "Commit repo first"
  exit 1
fi

VERSION=v$(cat package.json | awk 'BEGIN{FS="\""}/"version"/{print $4}')
! [ -z $(git tag -l $VERSION) ] && echo "Tag already exists" && exit 1

yarn lint \
  && yarn test \
  && yarn build \
  && chmod +x dist/index.cjs \
  && cat .gitignore | awk '$0!~"dist"{print}' > ~.gitignore \
  && mv ~.gitignore .gitignore \
  && yarn changelog > changelog.txt \
  && git add . \
  && git commit -m $VERSION \
  && git tag $VERSION \
  && git push --tags origin \
  && gh release create $VERSION \
    --title $VERSION \
    --notes-file changelog.txt \
    --latest \\
  && git reset --hard HEAD~1