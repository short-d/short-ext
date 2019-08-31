#!/usr/bin/env bash

yarn build

mkdir -p build/short-ext

mv build/background.js build/short-ext/
cp manifest.json build/short-ext/
cp -r icons build/short-ext/

zip -r build/short-ext.zip build/short-ext/* -x "*.DS_Store"