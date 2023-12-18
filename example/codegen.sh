#!/bin/sh

set -ex

# rm -rf node_modules/@lucra-sports
# yarn add ../.
rm -rf node_modules
yarn
mkdir -p ../android/src/paper/java/com/lucrasdk
cd android
./gradlew generateCodegenArtifactsFromSchema
cd ..
cp ./node_modules/@lucra-sports/lucra-react-native-sdk/android/build/generated/source/codegen/java/com/lucrasdk/NativeLucraClientSpec.java ../android/src/paper/java/com/lucrasdk