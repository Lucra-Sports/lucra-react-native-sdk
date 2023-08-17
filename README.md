# lucra-react-native-sdk

## Pre-Installation

Setup GitHub Personal Access token
https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
Select "Classic" with the `packages:read` permissions and name it "Lucra Token".

## Installation

### NPM

Install the package to your React Native Repo by running:

```sh
yarn add lucra-react-native-sdk
```

### iOS

In your `ios` folder Podfile:

Add the following lines to the top of your Podfile to allow Cocoa Pods to find our native SDK dependency

```sh
source 'https://github.com/Lucra-Sports/lucra-ios-sdk.git'
source 'https://cdn.cocoapods.org/'

use_frameworks!
```

Comment out the use of Flipper as it fails to link when using use_frameworks!:

```sh
# :flipper_configuration => flipper_config,
```

Run the following command to add the native SDK dependency locally that you added previously as a source in the Podfile

```sh
pod repo add LucraSDK https://github.com/Lucra-Sports/lucra-ios-sdk
```

### Android

// TODO:

## React Native Usage

Import the required items from `lucra-react-native-sdk`.
Initialize LucraClient with your provided key and set the appropriate environment.
LucraClient uses ReactNative Context so you can present a flow from the context anywhere in your hierarchy.

```js
import {
  LucraClient,
  LucraEnvironment,
  LucraFlow,
  LucraClientContext,
} from 'lucra-react-native-sdk';

// ...

<LucraClient
  authenticationClientID="<YOUR KEY HERE>"
  environment={LucraEnvironment.Staging}
>
  <View style={styles.container}>
    <LucraClientContext.Consumer>
      {(context) => (
        <View>
          <Button
            title="Show Profile"
            onPress={() => context.present(LucraFlow.Profile)}
          />
        </View>
      )}
    </LucraClientContext.Consumer>
  </View>
</LucraClient>;
```
