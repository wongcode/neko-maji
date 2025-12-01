#!/bin/bash
set -e

echo "Running Verification Suite..."

echo "1. Type Checking..."
npm run build

echo "2. Automated Tests..."
npx vitest run

echo "3. Verification Checklist:"
cat docs/TESTING.md

echo ""
echo "Please manually verify the items above."
