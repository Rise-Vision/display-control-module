#!/bin/bash

set -x
rm -rf build-temp
mkdir -p build-temp
cp package.json ./build-temp
cd ./build-temp
npm install --production
cd ..

ARCHS=(x32 x64 x-armv7l)

for ARCH in "${ARCHS[@]}"
do
  rm -rf build-${ARCH}
  mkdir -p build-${ARCH}
  cp ./build-temp/package.json ./build-${ARCH}
  cp -r ./build-temp/node_modules ./build-${ARCH}
  "$(npm bin)"/electron-rebuild --version 1.7.8 --arch ${ARCH} --only serialport --module-dir ./build-${ARCH}
done
rm -rf build
mkdir -p build
