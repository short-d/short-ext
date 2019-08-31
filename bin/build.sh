#!/usr/bin/env bash

rm -rf build
mkdir -p build/short-ext
yarn
tsc
mv build/background.js build/short-ext/
cp manifest.json build/short-ext/
cp -r icons build/short-ext/

cd build
yarn build
