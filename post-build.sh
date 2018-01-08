#!/bin/bash

set -x
ARCHS=(32 64 armv7l)

for ARCH in "${ARCHS[@]}"
do
  if [ $ARCH == "armv7l" ]
  then
    cp build-armv7l/*.sh build
    rm -rf build-x-armv7l
  else
    cp build-${ARCH}/*.{sh,exe} build
    rm -rf build-x${ARCH}
  fi
  rm -rf build-${ARCH}
done

rm -rf build-temp

