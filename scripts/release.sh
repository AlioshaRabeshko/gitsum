if [[ -n $(git status -s) ]]; then
  echo "Commit repo first"
  exit 1
fi

VERSION=v$(cat package.json | awk 'BEGIN{FS="\""}/"version"/{print $4}')

yarn build
chmod +x dist/index.cjs
cat .gitignore | awk '$0!~"dist"{print}' > ~.gitignore
mv ~.gitignore .gitignore
npm publish
git reset --hard origin/master