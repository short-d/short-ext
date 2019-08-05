#!/usr/bin/env bash

rm -rf build
mkdir build
yarn
tsc
cp manifest.json build