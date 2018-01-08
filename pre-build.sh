#!/bin/bash

set -x
rm -rf build-temp
mkdir -p build-temp
cp package.json ./build-temp
cd ./build-temp
npm install --production
cd ..

ARCHS=(x32 x64 armv7l)

for ARCH in "${ARCHS[@]}"
do
  rm -rf build-${ARCH}
  mkdir -p build-${ARCH}/display-control
  cp ./build-temp/package.json ./build-${ARCH}/display-control
  cp -r ./build-temp/node_modules ./build-${ARCH}/display-control
  "$(npm bin)"/electron-rebuild --version 1.7.8 --arch ${ARCH} --only serialport --module-dir ./build-${ARCH}/display-control
done
rm -rf build
mkdir -p build
