#!/bin/bash

set -x
rm -rf build-temp
mkdir -p build-temp
cp package.json ./build-temp
cd ./build-temp
npm install --production
cd ..

PLATFORMS=(win lnx)
ARCHS=(x32 x64)

for PLATFORM in "${PLATFORMS[@]}"
do
  for ARCH in "${ARCHS[@]}"
  do
    rm -rf build-${PLATFORM}-${ARCH}
    mkdir -p build-${PLATFORM}-${ARCH}
    cp ./build-temp/package.json ./build-${PLATFORM}-${ARCH}
    cp -r ./build-temp/node_modules ./build-${PLATFORM}-${ARCH}
    rm -rf ./build-${PLATFORM}-${ARCH}/node_modules/serialport/bin
    if [ $PLATFORM == "lnx" ] && [ $ARCH == "x32" ]
    then
      cp -r ./serialport/lnx/x86/bin ./build-${PLATFORM}-${ARCH}/node_modules/serialport
    elif [ $PLATFORM == "win" ] && [ $ARCH == "x32" ]
    then
      cp -r ./serialport/win/ia32/bin ./build-${PLATFORM}-${ARCH}/node_modules/serialport
    else
      cp -r ./serialport/${PLATFORM}/${ARCH}/bin ./build-${PLATFORM}-${ARCH}/node_modules/serialport
    fi
  done
done

rm -rf build
mkdir -p build
