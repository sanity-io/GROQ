#!/bin/bash -e

# Inspired by:
# https://github.com/graphql/graphql-spec/blob/main/publish.sh

PUBLISH_DIR="gh-pages"

echo "Building spec"
npm run build > /dev/null 2>&1

mkdir -p "$PUBLISH_DIR"

# Replace /draft with this build.
echo "Publishing to: /draft"
rm -rf "$PUBLISH_DIR/draft"
cp -R out/ "$PUBLISH_DIR/draft"

echo "Current head: $(git rev-parse HEAD)"
echo "Current dir: $(pwd)"
echo "Current branch: $(git branch --show-current)"
echo "Current tag: $(git tag --points-at HEAD)"
echo "Current SHA: $GITHUB_SHA"
echo "All tags: $(git tag -l)"

CURRENT_VERSION=$(git tag --points-at $GITHUB_SHA | grep 'GROQ-\d.*')

echo "Current version: $CURRENT_VERSION"

# If this is a tagged commit, publish to a permalink and index.
if [ -n "$CURRENT_VERSION" ]; then
  echo "Publishing to: /$CURRENT_VERSION"
  cp -R out/ "$PUBLISH_DIR/$CURRENT_VERSION"
fi

# Update index
echo "Updating index"
git tag -l --format='%(creatordate:unix) %(refname:lstrip=2)' | sort -r |
  node scripts/generate-index.js > "$PUBLISH_DIR/index.html"

echo "Done"
