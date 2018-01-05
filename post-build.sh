#!/bin/bash

set -x
ARCHS=(x32 x64 armv7l)

for ARCH in "${ARCHS[@]}"
do
  if [ $ARCH == "armv7l" ]
  then
    cp build-armv7l/*.sh build
  else
    cp build-${ARCH}/*.{sh,exe} build
  fi
  rm -rf build-${ARCH}
done

rm -rf build-temp

