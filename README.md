# lucra-react-native-sdk

## Pre-Installation

You will need to specify our **private** native iOS dependency, hosted in GitHub packages, in your Podfile. There are two ways to install a private dependency:

### With GitHub Personal Access token

https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

Select "Classic" with the `packages:read` permissions and name it "Lucra Token". When installing the native dependencies you will be prompted for your username and this token

### With SSH

You can skip this step if you have set up SSH for your GitHub account. In the next steps, you will see how to declare the dependency both ways.

## Installation

### NPM

Install the package to your React Native Repo by running:

```sh
yarn add @lucra-sports/lucra-react-native-sdk
```

### iOS

In your `ios` folder Podfile:

Add the following lines to the top of your Podfile to allow Cocoa Pods to find our native SDK dependency, check out the [example Podfile](https://github.com/Lucra-Sports/lucra-react-native-sdk/blob/main/example/ios/Podfile) for a reference:

```sh
# Pick one of the following two
# Use https if you are using a GitHub token method
source 'https://github.com/Lucra-Sports/lucra-ios-sdk.git'
# OR
# Use SSL if you have set up your SSH credentials for your GitHub account
source 'git@github.com:Lucra-Sports/lucra-ios-sdk.git'

# Independent of which method you choose, always add these
source 'https://cdn.cocoapods.org/'

use_frameworks!
```

You will need to disable as well Flipper as it fails to link when using use_frameworks!:

```sh
# You can either comment out this line
# :flipper_configuration => flipper_config,

# Or choose the disabled configuration
flipper_config = FlipperConfiguration.disabled
```

Run the following command to add the native SDK dependency locally that you added previously as a source in the Podfile

```sh
pod repo add LucraSDK https://github.com/Lucra-Sports/lucra-ios-sdk
```

### Android

// TODO:

## Usage

Import the SDK from the `@lucra-sports/lucra-react-native-sdk` package, you must initialize the SDK with an API key and an environment before anything else.

```ts
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import React from 'react';
import { Button, StyleSheet, View } from 'react-native';

LucraSDK.init('BHGhy6w9eOPoU7z1UdHffuDNdlihYU6T', LucraSDK.ENVIRONMENT.STAGING);

export default function App() {
  return (
    <View style={styles.container}>
      <Button
        title="Show Profile"
        onPress={() => LucraSDK.present(LucraSDK.FLOW.PROFILE)}
      />
      <Button
        title="Show Add Funds"
        onPress={() => LucraSDK.present(LucraSDK.FLOW.ADD_FUNDS)}
      />
    </View>
  );
}
```
