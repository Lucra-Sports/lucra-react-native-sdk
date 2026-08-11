# lucra-react-native-sdk

# Documentation

Start here for the new, structured docs: [docs/0.0.0_SDK_README.md](docs/0.0.0_SDK_README.md)

# For Maintainers

## Publishing

Publishing the package can be automatically be done for you via GitHub action, just push a tag with a SEMVER format (e.g. `3.1.2`) and the CI will automatically publish that commit with the tag version.

## Contributing

For contributors, to test your local changes in an expo app: create a new expo project next to the repo folder and declare your dependency as:

```json
    "@lucra-sports/lucra-react-native-sdk": "file:../lucra-react-native-sdk",
```

This will allow Expo to copy the SDK from source and link everything correctly. On every change you need to clear your `node_modules` so a new copy is performed.

If you use yarn you might try other protocols that symlink the dependency such as:

```json
    "@lucra-sports/lucra-react-native-sdk": "link:../lucra-react-native-sdk",
```

Or

```json
    "@lucra-sports/lucra-react-native-sdk": "portal:../lucra-react-native-sdk",
```

But metro/expo might not be able to follow the symlink properly.
