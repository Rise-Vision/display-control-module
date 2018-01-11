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
    rm -rf build-${PLATFORM}-x${ARCH}
    mkdir -p build-${PLATFORM}-${ARCH}
    cp ./build-temp/package.json ./build-${PLATFORM}-${ARCH}
    cp -r ./build-temp/node_modules ./build-${PLATFORM}-${ARCH}
    rm -rf ./build-${PLATFORM}-${ARCH}/node_modules/serialport/bin
    rm -rf ./build-${PLATFORM}-${ARCH}/node_modules/serialport/build/Release
    if [ $PLATFORM == "lnx" ] && [ $ARCH == "x32" ]
    then
      cp -r ./serialport/lnx/x86/bin ./build-${PLATFORM}-${ARCH}/node_modules/serialport
      cp -r ./serialport/lnx/x86/build/Release ./build-${PLATFORM}-${ARCH}/node_modules/serialport/build
    elif [ $PLATFORM == "win" ] && [ $ARCH == "x32" ]
    then
      cp -r ./serialport/win/ia32/bin ./build-${PLATFORM}-${ARCH}/node_modules/serialport
      cp -r ./serialport/win/ia32/build/Release ./build-${PLATFORM}-${ARCH}/node_modules/serialport/build
    else
      cp -r ./serialport/${PLATFORM}/${ARCH}/bin ./build-${PLATFORM}-${ARCH}/node_modules/serialport
      cp -r ./serialport/${PLATFORM}/${ARCH}/build/Release ./build-${PLATFORM}-${ARCH}/node_modules/serialport/build
    fi
  done
done

#RPI
rm -rf build-lnx-armv7l
rm -rf build-lnx-x-armv7l
mkdir -p build-lnx-x-armv7l
cp ./build-temp/package.json ./build-lnx-x-armv7l
cp -r ./build-temp/node_modules ./build-lnx-x-armv7l
rm -rf ./build-lnx-x-armv7l/node_modules/serialport/bin
rm -rf ./build-lnx-x-armv7l/node_modules/serialport/build/Release
cp -r ./serialport/lnx/armv7l/bin ./build-lnx-x-armv7l/node_modules/serialport
cp -r ./serialport/lnx/armv7l/build/Release ./build-lnx-x-armv7l/node_modules/serialport/build

rm -rf build
mkdir -p build
