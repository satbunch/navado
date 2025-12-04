#!/bin/bash
rm -rf dist
mkdir -p dist/js dist/options dist/icons

cp manifest.json dist/
cp content.js dist/
cp content.css dist/
cp popup.html dist/
cp popup.js dist/
cp js/*.js dist/js/
cp options/* dist/options/
cp icons/* dist/icons/

cd dist
zip -r ../Navado-${1}.zip .
cd ..
