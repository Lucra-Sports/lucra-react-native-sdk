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

```ruby
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

You will need to disable Flipper as it fails to link when using `use_frameworks!``:

```ruby
# You can either comment out this line
# :flipper_configuration => flipper_config,

# Or choose the disabled configuration
flipper_config = FlipperConfiguration.disabled
```

Run the following command to add the native SDK dependency locally that you added previously as a source in the Podfile

```sh
pod repo add LucraSDK https://github.com/Lucra-Sports/lucra-ios-sdk
```

The following keys will need to be set in Info.plist or the binary may be rejected and the app may crash:

NSBluetoothAlwaysUsageDescription
NSBluetoothPeripheralUsageDescription
NSFaceIDUsageDescription
NSLocalNetworkUsageDescription
NSLocationAlwaysAndWhenInUseUsageDescription
NSLocationAlwaysUsageDescription
NSLocationWhenInUseUsageDescription
NSMotionUsageDescription
NSCameraUsageDescription
NSPhotoLibraryUsageDescription

### Android

Lucra Android Native SDK artifacts are privately hosted on https://github.com/Lucra-Sports/lucra-android.

You will need a private access token (PAT) to pull these packages at build time.

### With GitHub Personal Access token (skip this if you've already created one for iOS above)

https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

Select "Classic" with the `packages:read` permissions and name it "Lucra Token". When installing the native dependencies you will be prompted for your username and this token

### Place credentials on local machine and build server

Once a PAT is obtained, you will need to store them on your machine for building locally and in your system environment for build pipelines. The SDK will look for the `gradle.properties` first then fallback on the `System.env` property.

### Set PAT for local Android development

Place the following lines either on your machine's (Linux/Mac) `~ .gradle/gradle.properties` file (create one if it doesn't exist), or in your Android project's `gradle.properties` file. If you use your Android project's `gradle.properties` file, be sure to not check this into your repo.

```gradle
GPR_USER=YOUR_USERNAME
GPR_KEY=YOUR_PAT
```

### Set PAT for Android CI/CD pipelines

In order to build the project on your pipelines, the system env variables should be set.

```yml
build-android:
  runs-on: ubuntu-latest
  env:
    #fetch from GitHub secrets or similar, don't check PATs into the build code
    GPR_USER: YOUR_USERNAME
    GPR_KEY: YOUR_PAT
    # ...
```

Both approaches work for local and build servers, but `~ .gradle/gradle.properties` for local development and `env:` for build pipelines are the best ways to keep your PATs safe.

### Provide GPR Access with GPR credentials

After GPR_USER and GPR_KEY are correctly fetched at build time, you'll then need to provide repository access for gradle to resolve the private artifacts at build time.

In your root Android project's `build.gradle`

```gradle

  allprojects {
    repositories {
      maven {
        name = "LucraGithubPackages"
        url = uri("https://maven.pkg.github.com/Lucra-Sports/lucra-android")
        credentials {
          username = findProperty('GPR_USER') ?: System.getenv('GPR_USER')
          password = findProperty('GPR_KEY') ?: System.getenv('GPR_KEY')
        }
      }
      maven {
        url "https://zendesk.jfrog.io/zendesk/repo"
      }
    }
  }
```

# Android Auth0 compliance (if not already using Auth0)

We use Auth0 for auth, if your app doesn't use it already, add the following to your app's default config.

Gradle.kts

```
android{
    defaultConfig {
        addManifestPlaceholders(mapOf("auth0Domain" to "LUCRA_SDK", "auth0Scheme" to "LUCRA_SDK"))
    }
}
```

Groovy

```
android {
  defaultConfig {
    manifestPlaceholders = [
      'auth0Domain': 'LUCRA_SDK',
      'auth0Scheme': 'LUCRA_SDK'
    ]
  }
}
```

## Usage

Import the SDK from the `@lucra-sports/lucra-react-native-sdk` package, you must initialize the SDK with an API key and an environment before anything else.

```ts
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import React from 'react';
import { Button, StyleSheet, View } from 'react-native';

LucraSDK.init('BHGhy6w9eOPoU7z1UdHffuDNdlihYU6T', LucraSDK.ENVIRONMENT.STAGING);
```

To utilize the UI layer use the `.present` function and pass in the flow you want to show:

```ts
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

To utilize the API layer will require both using the Frontend SDK (shown below) as well as integrating several API calls on your Backend to set/fetch data to/from the Lucra system at appropriate times. View the APIIntegration.pdf document in this repo for more information:

```ts
export default function App() {
  return (
    <View style={styles.container}>
      <Button
        title="Create Matchup"
        onPress={() => {
            LucraSDK.createGamesMatchup('DARTS', 1.0)
              .then((res) => {
                // Store matchup info to use in later api calls
              })
              .catch((e) => {
                // Handle error and present appropriate Lucra flow if needed
              });
          }}
      />
    </View>
  );
}
```