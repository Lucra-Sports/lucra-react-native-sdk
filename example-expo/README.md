# Lucra Expo Sample app

## Running

- After doing a `yarn install`, create a symlink to allow metro to correctly resolve the dependency on the upper package (from the root repo):

```
cd example-expo/node_modules
mkdir -p @lucra-sports
cd @lucra-sports
ln -s ../../../ lucra-react-native-sdk
```

- Follow the instructios on the main readme to create a github classic token and create the .npmrc
- `yarn`
- `yarn expo prebuild --clean`
- `yarn expo run:ios`
