#!/bin/bash

set -x

#RPI
cp build-lnx-armv7l/*.sh build
rm -rf build-lnx-x-armv7l
rm -rf build-lnx-armv7l

ARCHS=(32 64)

# Windows
for ARCH in "${ARCHS[@]}"
do
  cp build-win-${ARCH}/*.exe build
  rm -rf build-win-x${ARCH}
  rm -rf build-win-${ARCH}
done

# Linux
for ARCH in "${ARCHS[@]}"
do
  cp build-lnx-${ARCH}/*.sh build
  rm -rf build-lnx-x${ARCH}
  rm -rf build-lnx-${ARCH}
done

rm -rf build-temp

