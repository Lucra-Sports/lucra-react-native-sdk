#!/bin/sh

set -ex

mkdir -p ../android/src/paper/java/com/lucrasdk
cd android
./gradlew generateCodegenArtifactsFromSchema
cd ..
cp ./node_modules/@lucra-sports/lucra-react-native-sdk/android/build/generated/source/codegen/java/com/lucrasdk/NativeLucraSDKSpec.java ../android/src/paper/java/com/lucrasdk