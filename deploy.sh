#!/usr/bin/env bash
set -euo pipefail

message="${1:-Update survey app}"

git add .

if git diff --cached --quiet; then
  echo "No changes to deploy."
  exit 0
fi

git commit -m "$message"
git push

echo "Deployed to GitHub Pages:"
echo "https://mayumi-josanin.github.io/mayumi_bijiris/"
