#!/bin/bash

set -x
rm -rf build-temp
mkdir build-temp
cp package.json ./build-temp
cd ./build-temp
npm install --production
cd ..

PLATFORMS=(win lnx)
ARCHS=(32 64)

for PLATFORM in "${PLATFORMS[@]}"
do
  for ARCH in "${ARCHS[@]}"
  do
    rm -rf build-${PLATFORM}-${ARCH}
    mkdir build-${PLATFORM}-${ARCH}
    cp ./build-temp/package.json ./build-${PLATFORM}-${ARCH}
    cp -r ./build-temp/node_modules ./build-${PLATFORM}-${ARCH}
    cp -r ./src ./build-${PLATFORM}-${ARCH}
    cp ./webpack.config.js ./build-${PLATFORM}-${ARCH}
    rm -rf ./build-${PLATFORM}-${ARCH}/node_modules/serialport/bin
    rm -rf ./build-${PLATFORM}-${ARCH}/node_modules/serialport/build/Release
    if [ $PLATFORM == "lnx" ] && [ $ARCH == "32" ]
    then
      cp -r ./serialport/lnx/ia32/bin ./build-${PLATFORM}-${ARCH}/node_modules/serialport
      cp -r ./serialport/lnx/ia32/build/Release ./build-${PLATFORM}-${ARCH}/node_modules/serialport/build
    elif [ $PLATFORM == "win" ] && [ $ARCH == "32" ]
    then
      cp -r ./serialport/win/ia32/bin ./build-${PLATFORM}-${ARCH}/node_modules/serialport
      cp -r ./serialport/win/ia32/build/Release ./build-${PLATFORM}-${ARCH}/node_modules/serialport/build
    else
      cp -r ./serialport/${PLATFORM}/x${ARCH}/bin ./build-${PLATFORM}-${ARCH}/node_modules/serialport
      cp -r ./serialport/${PLATFORM}/x${ARCH}/build/Release ./build-${PLATFORM}-${ARCH}/node_modules/serialport/build
    fi
  done
done

#RPI
rm -rf build-lnx-armv7l
mkdir -p build-lnx-armv7l
cp ./build-temp/package.json ./build-lnx-armv7l
cp -r ./src ./build-lnx-armv7l
cp ./webpack.config.js ./build-lnx-armv7l
cp -r ./build-temp/node_modules ./build-lnx-armv7l
rm -rf ./build-lnx-armv7l/node_modules/serialport/bin
rm -rf ./build-lnx-armv7l/node_modules/serialport/build/Release
cp -r ./serialport/lnx/armv7l/bin ./build-lnx-armv7l/node_modules/serialport
cp -r ./serialport/lnx/armv7l/build/Release ./build-lnx-armv7l/node_modules/serialport/build

for PLATFORM in "${PLATFORMS[@]}"
do
  for ARCH in "${ARCHS[@]}"
  do
    cd ./build-${PLATFORM}-${ARCH}
    ../node_modules/.bin/webpack
    cd ..
  done
done

cd ./build-lnx-armv7l
../node_modules/.bin/webpack
cd ..

rm -rf build
mkdir build

cp ./build-lnx-32/build/display-control-lnx-32.sh ./build
cp ./build-lnx-64/build/display-control-lnx-64.sh ./build
cp ./build-win-32/build/display-control.exe ./build/display-control-win-32.exe
cp ./build-win-64/build/display-control.exe ./build/display-control-win-64.exe
cp ./build-lnx-armv7l/build/display-control-lnx-armv7l.sh ./build

rm -rf build-*
