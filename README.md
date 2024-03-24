# lucra-react-native-sdk

# Pre-Installation

You will need to specify our **private** native iOS dependency, hosted in GitHub packages, in your Podfile. There are two ways to install a private dependency:

<a name="personal_token_anchor"></a>

## With GitHub Personal Access token

https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

Select "Classic" with the `packages:read` and `repo` permissions enabled and name it "Lucra Token". When installing the native dependencies you will be prompted for your username and this token. In case you are setting up a CI system you will also have to use this token in a combination with a username.

<img src="https://github.com/Lucra-Sports/lucra-react-native-sdk/blob/main/assets/token.png?raw=true" width="300"/>

## With SSH

You can skip creating a token if you have set up SSH for your GitHub account. In the next steps, you will see how to declare the dependency both ways. However, bear in mind if setting up in a CI you might need to create a token to correctly add the private repo to CocoaPods.

# Installation

## NPM

After you have your token setup you need to create a `.npmrc` file and you need to tell the package needs to be fetched from the github registry:

```
//npm.pkg.github.com/:_authToken=GITHUB_PERSONAL_TOKEN
@lucra-sports:registry=https://npm.pkg.github.com
```

Install the package to your React Native Repo by running:

```sh
npm i -s @lucra-sports/lucra-react-native-sdk
```

## iOS

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

use_frameworks! linkage: :static
```

You will need to disable Flipper as it fails to link when using `use_frameworks!``:

```ruby
# You can either comment out this line
# :flipper_configuration => flipper_config,

# Or choose the disabled configuration
flipper_config = FlipperConfiguration.disabled
```

The minimum target version is iOS 15, so you will also have to update this on your project (You can do it in the XCode general tab) and on your podfile:

```
platform :ios, 15.0
```

### Add Lucra private pod repo

Run the following command to add the native SDK dependency locally that you added previously as a source in the Podfile

```sh
# In a local machine you can add it directly
pod repo add LucraSDK https://github.com/Lucra-Sports/lucra-ios-sdk
# OR
pod repo add LucraSDK git@github.com/Lucra-Sports/lucra-ios-sdk

# If setting up in a CI you will need the Personal Access token you first created and a username
# Here is an example for GitHub Actions. Add LUCRA_USERNAME and LUCRA_TOKEN in the secrets section of the GitHub repository
- name: Add private repo to cocoapods
  run: pod repo add LucraSDK https://${{secrets.LUCRA_USERNAME}}:${{secrets.LUCRA_TOKEN}}@github.com/Lucra-Sports/lucra-ios-sdk.git
```

### Permissions

The following keys will need to be set in `Info.plist` or the binary may be rejected and the app will crash.

```
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
```

## Android

Lucra Android Native SDK artifacts are privately hosted on https://github.com/Lucra-Sports/lucra-android.

You will need a private access token (PAT) to pull these packages at build time.

[See how to create personal access token](#personal_token_anchor)

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

### Android Auth0 compliance (if not already using Auth0)

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

### Min API version

LucraSDK requires a minimum API version of 24, you will have to update your project to bump this:

```
// android/build.gradle
buildscript {
  ext {
    buildToolsVersion = "34.0.0"
    minSdkVersion = 24 // <-------- MAKE SURE THIS IS AT LEAST 24
    compileSdkVersion = 34
    ndkVersion = "25.1.8937393"
    targetSdkVersion = 34
    kotlinVersion = "1.8.0"
  }
```

### Manifest Requirements

The following manifest permissions, features, receivers and services are required to use Lucra

```xml

<manifest
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools" <!-- DO NOT SKIP! -->
>
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="com.google.android.gms.permission.AD_ID" />
    <uses-permission android:name="android.webkit.PermissionRequest" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="com.google.android.providers.gsf.permission.READ_GSERVICES" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-feature android:name="android.hardware.camera.autofocus" />
    <uses-feature android:name="android.hardware.camera" />

    <application
    ...
    >

    <!--    Geocomply requirements-->
    <receiver android:name="com.geocomply.client.GeoComplyClientBootBroadcastReceiver"
        android:enabled="true" android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.BOOT_COMPLETED" />
            <action android:name="android.intent.action.QUICKBOOT_POWERON" />
        </intent-filter>
    </receiver>

    <service android:name="com.geocomply.location.WarmingUpLocationProvidersService"
        android:exported="false" />
    <service android:name="com.geocomply.security.GCIsolatedSecurityService"
        android:exported="false" android:isolatedProcess="true" tools:targetApi="q" />

    <receiver android:name="com.geocomply.client.GeoComplyClientBroadcastReceiver" />
</application>
</manifest>
```

### Application Requirements

Lucra leverages [Coil](https://coil-kt.github.io/coil/) to render images and SVGs. In your
application class, provide the LucraCoilImageLoader

```kotlin
// Don't forget to set the app manifest to use this Application
class MyApplication : Application(), ImageLoaderFactory {
    // Use Lucra's ImageLoader to decode SVGs as needed
    override fun newImageLoader() = LucraCoilImageLoader.get(this)
}

```

# Usage

Import the SDK from the `@lucra-sports/lucra-react-native-sdk` package, you must initialize the SDK with an API key and an environment before anything else.

```ts
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import React from 'react';
import { Button, StyleSheet, View } from 'react-native';

let lucraSDKOptions = {
  apiURL: 'https://api.lucra.com',
  apiKey: <insert your key here>,
  environment: LucraSDK.ENVIRONMENT.SANDBOX,
  theme: {
    background: '#001448',
    surface: '#1C2575',
    primary: '#09E35F',
    secondary: '#5E5BD0',
    tertiary: '#9C99FC',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    onPrimary: '#001448',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    fontFamily:
      Platform.OS === 'ios'
        ? 'Inter'
        : {
            normal: 'Inter-Regular',
            bold: 'Inter-Bold',
            semibold: 'Inter-SemiBold',
            medium: 'Inter-Medium',
          },
  },
};

LucraSDK.init(lucraSDKOptions);
```

To utilize the UI layer use the `.present` function and pass in the flow you want to show:

```ts
// Posible flows are
// ONBOARDING
// VERIFY_IDENTITY
// PROFILE
// ADD_FUNDS
// CREATE_GAMES_MATCHUP
// WITHDRAW_FUNDS
// PUBLIC_FEED
// MY_MATCHUP
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

To utilize the API layer will require both using the Frontend SDK (shown below) as well as integrating several API calls on your Backend to set/fetch data to/from the Lucra system at appropriate times. View the [APIIntegration](APIIntegration.pdf) document in this repo for more information:

```ts
import {
  LucraSDK,
  type LucraSDKError,
} from '@lucra-sports/lucra-react-native-sdk';

function handleLucraSDKError(e: LucraSDKError) {
  switch (e.code) {
    case 'notInitialized':
      console.warn('SDK not initialized', e);
      LucraSDK.present(LucraSDK.FLOW.ONBOARDING);
      break;

    case 'unverified':
      console.warn('User not verified', e);
      LucraSDK.present(LucraSDK.FLOW.VERIFY_IDENTITY);
      break;

    case 'notAllowed':
      console.warn('User not allowed', e);
      break;

    case 'insufficientFunds':
      console.warn('Insufficient funds', e);
      LucraSDK.present(LucraSDK.FLOW.ADD_FUNDS);
      break;

    case 'unknown':
      console.warn('Unknown error', e);
      break;

    default:
      break;
  }
}

export default function App() {
  let [id, setId] = useState()
  return (
    <View style={styles.container}>
      <Button
        title="Get matchup"
        onPress={() => {
          LucraSDK.getGamesMatchup(id).then(...)
        }}
      >
      <Button
        title="Create Matchup"
        onPress={() => {
          LucraSDK.createGamesMatchup('DARTS', 1.0)
            .then((res) => {
              setId(res.id)
            })
            .catch(handleLucraSDKError);
        }}
      />
    </View>
  );
}
```

## User configuration

You can configure and retrieve the lucra user via the following methods.

```ts
await LucraSDK.configureUser({
  firstName: 'Mike',
  address: {
    address: 'New York',
  },
});

let user = await LucraSDK.getUser();
```

## User callback

You can subscribe to changes in the user object via callback (currently only supported in iOS)

```ts
LucraSDK.registerUserCallback(({ user, error }) => {
  if (error) {
    // Android will return this error when the user is not logged in
    console.log('user callback error', error);
    return;
  }

  if(user == null) {
    // on iOS if the returned value is null (meaning the user has logged out) this callback has ended
    // therefore if you still want to listen to events you will need to register on log-in again
    // on Android you can keep the same callback
    if(Platform.OS === 'ios') {
      console.log("iOS user observer has completed! recreate on next log in)
    }

    console.log("User is null!)
  } else {
    console.log(`✅ recevied user callback: ${user}`);
  }
});
```

## Embed flows in a view

You can embed a flow inside a normal react native component:

**Currently supported in iOS**

```ts
import { LucraFlow, LucraSDK } from '@lucra-sports/lucra-react-native-sdk';

export const MainContainer: FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1">
        <Text className="text-white my-2"> Example embedded view</Text>
        <LucraFlow name={LucraSDK.FLOW.PROFILE} className="flex-1 bg-white" />
      </View>
    </SafeAreaView>
  );
};
```
