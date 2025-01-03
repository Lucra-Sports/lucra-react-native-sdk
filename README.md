# lucra-react-native-sdk

# Pre-Installation

The package works in both the new and old architecture.

You will need to specify our **private** native dependencies as they are hosted in GitHub packages. There are two ways to install a private dependency.

You need to create a Personal Access Token (PAT)

<a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens">Managing Personal Access Tokens</a>

Select "Classic" with the `packages:read` and `repo` permissions enabled and name it `Lucra Token`. When installing the native dependencies you will be prompted for your username and this token. In case you are setting up a CI system you will also have to use this token in a combination with a username.

<img src="https://github.com/Lucra-Sports/lucra-react-native-sdk/blob/main/assets/token.png?raw=true" width="300"/>

# Installation

## NPM

After you have your token you need to create a `.npmrc` file at the root of your project and you need to tell the package needs to be fetched from the github registry:

```
//npm.pkg.github.com/:_authToken=GITHUB_PERSONAL_TOKEN
@lucra-sports:registry=https://npm.pkg.github.com
```

Install the package to your React Native Repo by running:

```sh
npm i -s @lucra-sports/lucra-react-native-sdk
```

Usually you don't want to commit this file into the git repo history. So it's better to add it to your gitignore and each user on your organization has their own file and CI as well.

# Integrating with an Expo React Native App

This section provides instructions on how to integrate Lucra SDK into your Expo React Native application. The steps cover both iOS and Android platforms, focusing on projects that use `expo prebuild` or have been ejected, resulting in their own `ios` and `android` directories.

**Note:** This integration does not work with **Expo Go**, as Expo Go does not support custom native modules. You will need to build a standalone app using Expo's build services or build it locally.

## Expo Setup

To install the SDK in your Expo app, you have two main options:

1. **Use Prebuild or Eject Your App**: If your app uses `expo prebuild` or has been ejected, you can follow the platform-specific installation steps for each platform as detailed below.

2. **Use lucra-react-native-sdk expo plugin**: To avoid manual customization of the native directories, you can adjust your `app.config.js` file and utilize the provided Expo plugins to handle the necessary configurations.

### Using the Expo Build Properties Plugin

The [`expo-build-properties`](https://docs.expo.dev/versions/latest/sdk/build-properties/) plugin allows you to modify native build properties directly from your `app.config.js`. This is useful for setting deployment targets and specifying frameworks without touching the native code.

Update your `app.config.js` file with the following configuration to set the iOS deployment target and android minSDKVersion:

```javascript
    plugins: [
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '15.1',
            // The lucra SDK uses third-party services that require network inspection to be kept off.
            networkInspector: false,
          },
          android: {
            minSdkVersion: 24,
            networkInspector: false,
          },
        },
      ],
      '@lucra-sports/lucra-react-native-sdk',
    ],
```

### Using Expo Dev Client

When working with expo-dev-client, it's essential to disable the EX_DEV_CLIENT_NETWORK_INSPECTOR variable, The SDK uses third-party libraries that block network inspection.
To ensure that EX_DEV_CLIENT_NETWORK_INSPECTOR is turned off make sure networkInspector is false when using expo-build-properties.

## iOS

The minimum target version is iOS 15.1, so you will also have to update this on your project (You can do it in the XCode general tab) and in your podfile:

```
platform :ios, 15.1
```

In your `ios` folder Podfile:

Add the following lines to the top of your Podfile to allow Cocoa Pods to find our native SDK dependency, check out the [example Podfile](https://github.com/Lucra-Sports/lucra-react-native-sdk/blob/main/example/ios/Podfile) for a reference:

```ruby
source 'https://github.com/Lucra-Sports/lucra-ios-sdk.git'

# Independent of which method you choose, always add these
source 'https://cdn.cocoapods.org/'
```

use_frameworks! linkage: :static

### Flipper

If you are using Flipper. you will need to disable Flipper as it fails to link when using `use_frameworks!``:

```ruby
# You can either comment out this line
# :flipper_configuration => flipper_config,

# Or choose the disabled configuration
flipper_config = FlipperConfiguration.disabled
```

Flipper has been removed in the latest React-Native versions, so this might not apply to your app.

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

### Firebase

If using firebase some additional steps are required, start by following the general setup https://rnfirebase.io/

Make sure to enable firebase to use static frameworks editing your `/ios/Podfile`:

```ruby
# right after `use_frameworks! :linkage => :static`
$RNFirebaseAsStaticFramework = true
```

## Android

Lucra Android Native SDK artifacts are privately hosted on https://github.com/Lucra-Sports/lucra-android.

You will need the personal access token (PAT) created above to pull these packages at build time.

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

After `GPR_USER` and `GPR_KEY` are correctly fetched at build time, you'll then need to provide repository access for gradle to resolve the private artifacts at build time.

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
application class, provide the `LucraCoilImageLoader`

```kotlin
// Don't forget to set the app manifest to use this Application
class MyApplication : Application(), ImageLoaderFactory {
    // Use Lucra's ImageLoader to decode SVGs as needed
    override fun newImageLoader() = LucraCoilImageLoader.get(this)
}

```

### Firebase

You will need to add the firebase crashlytics plugin to your app's configuration.

First on your `android/build.gradle` file add the dependency to the buildscript:

```gradle
  dependencies {
    // Your other buildscript dependencies
    classpath 'com.google.firebase:firebase-crashlytics-gradle:2.9.8' // Add this
  }
```

Next edit your `android/app/build.gradle` file. At the top of the file apply the plugin:

```gradle
// Your other plugins
apply plugin: "com.google.firebase.crashlytics" // Add this
```

# Usage

Import the SDK from the `@lucra-sports/lucra-react-native-sdk` package, you must initialize the SDK with an API key and an environment before anything else. The initialization is a promise since communication with the backend is async and required on init.

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
    // Fonts
    //
    // For iOS you need to pass the cannonical name of your linked font
    // You can find this by opening your font files in FontBook
    //
    // For android you need to pass the path inside the Android assets folder
    // If you have linked your assets using the default location /assets/fonts
    // Then the android linked fonts should land in /android/app/src/main/assets/font
    // and the configuration should match the one below. You must specify all four keys.
    fontFamily:
      Platform.OS === 'ios'
        ? 'Inter'
        : {
            normal: 'fonts/Inter-Regular.ttf',
            bold: 'fonts/Inter-Bold.ttf',
            semibold: 'fonts/Inter-SemiBold.ttf',
            medium: 'fonts/Inter-Medium.ttf',
          },
  },
};

export default function App() {
  const [isReady, setIsReady] = useState(false)
  useEffect(() => {
    LucraSDK.init(lucraSDKOptions).then(() => {
      setIsReady(true)
    })
  }, [])

  if(!isReady){
    return null
  }

  return (<>...</>);
}
```

## Full-screen Flows

To utilize the UI layer use the `.present` function and pass in the flow you want to show:

```ts
export default function App() {
  return (
    <View style={styles.container}>
      <Button
        title="Show Profile"
        onPress={() => LucraSDK.present({name: LucraSDK.FLOW.PROFILE})}
      />
      <Button
        title="Show Add Funds"
        onPress={() => LucraSDK.present({name: LucraSDK.FLOW.ADD_FUNDS})}
      />
      <Button
        title="Create game matchup"
        // Some of the flows take parameters
        onPress={() => LucraSDK.present({ name: LucraSDK.FLOW.CREATE_GAMES_MATCHUP, gameId: 'pingpong'})}
        // Some of the other flows that take parameters
        // onPress={() => LucraSDK.present({ name: LucraSDK.FLOW.CREATE_GAMES_MATCHUP})}
      />
    </View>
  );
}
```

<!-- this two are not ready
        // LucraSDK.present({name LucraSDK.FLOW.GAME_CONTEST_DETAILS, matchupId: 'id', teamInviteId: 'id'})
        // LucraSDK.present({name LucraSDK.FLOW.SPORT_CONTEST_DETAILS, matchupId: 'id'})
-->

## Api calls

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
      LucraSDK.present({name: LucraSDK.FLOW.ONBOARDING});
      break;

    case 'unverified':
      console.warn('User not verified', e);
      LucraSDK.present({name: LucraSDK.FLOW.VERIFY_IDENTITY});
      break;

    case 'notAllowed':
      console.warn('User not allowed', e);
      break;

    case 'insufficientFunds':
      console.warn('Insufficient funds', e);
      LucraSDK.present({name: LucraSDK.FLOW.ADD_FUNDS});
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

You can subscribe to changes in the user object via callback:

```ts
const listener = LucraSDK.addListener("user", ({ user, error }) => {
  if (error) {
    // Android will return this error when the user is not logged in
    console.log('user callback error', error);
    return;
  }

  if(user == null) {
    // null value will be emitted on user logout
    console.log("User is null!)
  } else {
    console.log(`✅ recevied user callback: ${user}`);
  }
});

// If you are done listening for the user
listener()
```

## Embed Flows

You can embed a flow inside a normal React-Native views. Unfortunately on Android if you are using `react-native-screens` you will face an issue where components might disappear. This is due to incompatibility between jetpack compose, which the SDK uses internally. In order to get around this you need to re-mount the components whenever the screen is focused.

Here is a snippet on how to achieve this:

```tsx
import { LucraFlowView, LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import { useFocusEffect } from '@react-navigation/native';

export const MainContainer: FC<Props> = ({ navigation }) => {
  const [miniFeedKey, setMiniFeedKey] = useState(Math.random().toString());

  // create a new key everytime this screen is focused
  useFocusEffect(
    useCallback(() => {
      const keyFeed = Math.random().toString();
      setMiniFeedKey(keyFeed);
    }, [])
  );

  return (
    <SafeAreaView className="flex-1">
      <LucraFlowView
        flow={LucraSDK.FLOW.PROFILE}
        className="flex-1"
        key={miniFeedKey}
      />
    </SafeAreaView>
  );
};
```

## Deep link provider

Read up on the [native deep link documentation](https://docs.lucrasports.com/lucra-sdk/jpYRPQyBRCy9WVvSjRgO/integration-documents/ios-sdk/module-integration/deep-links) first.

Lucra can emit a request for you to "pack" an internal deep link into your deep link provider of choice. This is useful for example if you want to use a link shortener. You then return this deep link into Lucra so that it can be presented to the user:

```ts
import { registerDeepLinkProvider } from '@lucra-sports/lucra-react-native-sdk';
import { linkShortener } from 'my-link-shortener';

registerDeepLinkProvider(async (lucraDeepLink) => {
  const shortenedDeepLink = await linkShortener(lucraDeepLink);
  return shortenedDeepLink;
});
```

## Incoming deep links

For handling deep links that contain lucra information, you need to unpack your deep link and then pass it to the Lucra client to detect if a flow is embedded.

```ts
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import { Linking } from 'react-native';
import { linkExpander } from 'my-link-shortener';

// on app start
const linkingSubscription = Linking.addEventListener('url', async ({ url }) => {
  const deepLink = await linkExpander(url);
  const handled = await LucraSDK.handleLucraLink(deepLink);
  if (handled) {
    // Lucra has detected a link and will take over, displaying a full flow
    return;
  }
});

// You should follow the Deep linking guides for RN, on Android it is necessary to also call the getInitialURL
// to handle deep links that were called while app was closed
const initialLink = await Linking.getInitialURL();
if (initialLink) {
  // same as above
}
```

## Deep Link Configuration

Depending on the deeplink provider you use you may need additional configuration.

### Using RN Linking

Make sure to modify your AppDelegate.mm file to handle the openURL event and forward it to RCTLinkingManager
Note that in case you need to natively handle other incoming urls you can condition each one and forward to the correct link manager.

```swift
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  // Handle the incoming URL
  NSLog(@"Received URL: %@", url.absoluteString);
  if ([[url host] isEqualToString:@"venmo.com"]) {
    return [[LucraClient sharedInstance] handleVenmoUrl:url];
  }
  return [RCTLinkingManager application:application openURL:url options:options];
}
```

# Firebase Quirks

If using the new architecture you may notice firebase dynamic links not working on iOS when the app is closed, dynamic Links will be deprecated soon and they mention some workarounds updating your AppDelegate.mm file https://github.com/invertase/react-native-firebase/issues/4548#issuecomment-2302400275

Alternatively you can workaround the issue with getInitialLink using react-native Linking

```ts
if (Platform.OS === 'ios') {
  Linking.getInitialURL().then((res) => {
    console.log('Resolved with Linking', res);
    dynamicLinks()
      .resolveLink(res || '')
      .then((link) => {
        handleDeepLink({ url: link.url });
      });
  });
}
```

## Using firebase Dynamic Links

Follow the setup steps at https://rnfirebase.io/dynamic-links/usage

## Notes on managing deeplinks

To avoid calling the Lucra SDK before it is initialized you can render the deeplink handling functionality conditionally

```ts
const App = ()=>{
// initialize LucraSDK
return  {!isReady ? (
          <Text>Loading...</Text>
        ) : (
          <>
            <DeepLinkManager />
            ...Other components
        }
}

```

When your app goes to the background and is opened by a deeplink the UI may not be ready yet, you can leverage RN AppState and save the link for latter.

DeeplinkManager.tsx

```ts
export function DeepLinkManager() {
  // save the deeplink
  const savedDeepLink = useRef('');

  // listen for Appstate changes to consume the saved deeplink of any
  useEffect(() => {
    const appStateListener = AppState.addEventListener(
      'change',
      async (newAppState) => {
        if (newAppState === 'active' && savedDeepLink.current) {
          const handled = await LucraSDK.handleLucraLink(savedDeepLink.current);
          //or something if if not handled by Lucra SDK
        }
      }
    );

    const handleDeepLink = async ({ url }: { url: string }) => {
      // App is not active yet so we save the link for latter
      if (AppState.currentState !== 'active') {
        savedDeepLink.current = url;
        return;
      }

      // Otherwise is ready and can be used directly
      const handled = await LucraSDK.handleLucraLink(url);
    };

    // Specific firebase deeplink listeners
    dynamicLinks()
      .getInitialLink()
      .then((link) => {
        handleDeepLink({ url: link?.url || '' });
      });
    const unsubscribe = dynamicLinks().onLink(handleDeepLink);
    return () => {
      unsubscribe();
      appStateListener.remove();
    };
  }, []);

  return null;
}
```

# Listeners

## Games Contest Listener

You can also listen for the events when creating a games or sport contest.

```ts
const unsubscribe = LucraSDK.addContestListener({
  onGamesMatchupCreated: (id: string) => {
    console.log('Games contest created:', id);
  },
  onSportsMatchupCreated: (id: string) => {
    console.log('Sports contest created:', id);
  },
  onGamesMatchupAccepted: (id: string) => {
    console.log('Games contest accepted:', id);
  },
  onSportsMatchuptAccepted: (id: string) => {
    console.log('Sports contest accepted:', id);
  },
  onGamesMatchupCanceled: (id: string) => {
    console.log('Games matchup canceled', id);
  }
  onSportsMatchupCanceled: (id: string) => {
    console.log('Sports matchup canceled', id);
  }
});

// Once you are done or on hot reload
unsubscribe();
```

# Push notifications

## iOS

Read the [native documentation on push notifications](https://docs.lucrasports.com/lucra-sdk/jpYRPQyBRCy9WVvSjRgO/integration-documents/ios-sdk/module-integration/push-notifications). First you need to register for remote push notifications, depending on which library you are using this process will change. You will then need to get the device token so it can be passed to the Lucra SDK. Here is one example using [react-native-push-notifications](https://github.com/react-native-push-notification/ios).

1. Register the native module, [following the steps in the README](https://github.com/react-native-push-notification/ios#update-appdelegatem-or-appdelegatemm)
2. You should be able to add a listener for the 'register' event which will emit the device token in hex string format

```ts
import { registerDeviceTokenHex } from '@lucra-sports/lucra-react-native-sdk';
// There is also a base64 version
// import { registerDeviceTokenBase64 } from '@lucra-sports/lucra-react-native-sdk';

PushNotificationIOS.addEventListener('register', async (token) => {
  await registerDeviceTokenHex(token);
});

PushNotificationIOS.requestPermissions();
```

Handling push notifications follows a similar logic to handling of deep links:

```ts
import { handleLucraNotification } from '@lucra-sports/lucra-react-native-sdk';

export const App = () => {
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    const type = 'notification';
    PushNotificationIOS.addEventListener(type, onRemoteNotification);
    return () => {
      PushNotificationIOS.removeEventListener(type);
    };
  });

  const onRemoteNotification = (notification) => {
    const isClicked = notification.getData().userInteraction === 1;
    if (isClicked) {
      handleLucraNotification({
        // TODO which fields need to be there?
      });
    } else {
      // Do something else with push notification
    }
    // Use the appropriate result based on what you needed to do for this notification
    const result = PushNotificationIOS.FetchResult.NoData;
    notification.finish(result);
  };
};
```

## Android

For android you need to add the necessary [native code](https://github.com/Lucra-Sports/lucra-android-sdk?tab=readme-ov-file#setting-up-push-notifications) in order for you to get the device token and handle incoming push notifications.

# Credit conversion provider

To allow users to withdraw money in credits relevant to your internal system, you must register a `creditConversionProvider`. The Convert to Credit feature allows end users to convert dollars they've deposited or won playing contests into credit they can use within your ecosystem. The conversion process can be configured with a multiplier to incentivize opting for this conversion over other withdrawal methods.

```ts
import { registerCreditConversionProvider } from '@lucra-sports/lucra-react-native-sdk';

registerCreditConversionProvider(async (cashAmount: number) => {
  let convertedAmount = cashAmount * 3;
  return {
    id: 'unique-id',
    type: 'game-credits',
    title: 'Game Credits',
    convertedAmount,
    iconUrl: 'https://my-image.com/image.png', // optional
    convertedAmountDisplay: `${convertedAmount} credits`,
    shortDescription: 'This is a short description for the end user.',
    longDescription:
      'This is a longer, more descriptive version of a message you want the end user to see about.',
    metaData: {
      foo: 'bar',
    },
    cardColor: '#5A1668',
    cardTextColor: '#FFFFFF',
    pillColor: '#5A1668',
    pillTextColor: '#FFFFFF',
  };
});
```

# Reward Provider

A reward provider is meant to allow users to see and claim rewards once their matchup has finished. It has three parts:

- A callback that returns which rewards are available and will be displayed to the user
- A claim callback, which will be called once the user is ready to claim their reward after a matchup
- A viewRewards callback which will be triggered by the SDK for you to show the rewards to the user

```ts
import {
  registerRewardProvider,
  type LucraReward,
} from '@lucra-sports/lucra-react-native-sdk';

async function getAvailableRewards(): LucraReward[] {
  // your logic to fetch user available rewards comes here
  return [
    {
      rewardId: 'Reward123',
      title: 'My awesome reward',
      descriptor: 'descriptor',
      iconUrl: 'http://url.com/blah.jpg',
      bannerIconUrl: 'another jpg url',
      disclaimer: 'disclaimer',
      metadata: JSON.stringify({ otherData: 'you want' }),
    },
  ];
}

async function claimReward(reward: LucraReward) {
  // Assign the user their reward
}

function viewRewards() {
  // Show the users the match rewards
}

registerRewardProvider(getAvailableRewards, claimReward, viewRewards);
```

# Venmo iOS

The Lucra iOS SDK offers Venmo as a payment option. This guide covers implementation steps.

First you need to modify your `info.plist`. See the [iOS SDK instructions](https://docs.lucrasports.com/lucra-sdk/3v52KwIeTxQOM0ni1gLl/integration-documents/ios-sdk/module-integration/payments/venmo).

You then need to modify your `AppDelegate.mm`:

```obj-c
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
    // Handle the incoming URL
    NSLog(@"Received URL: %@", url.absoluteString);

    return [[LucraClient sharedInstance] handleVenmoUrl:url];
}
```

# For Maintainers

## Publishing

Publishing the package can be automatically be done for you via GitHub action, just push a tag with a SEMVER format (e.g. `3.1.2`) and the CI will automatically publish that commit with the tag version.
