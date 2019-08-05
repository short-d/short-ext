#!/usr/bin/env bash

rm -rf build
mkdir build
tsc
cp manifest.json build