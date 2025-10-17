# Setting up your machine to develop react-native apps

React Native depends on several frameworks and dependencies you need to setup, some locally some globally

## Dependencies via nvm, rubyenv and global installs

You can install the dependencies in however way you prefer. However certain tooling will help you.

`nvm` is ASDF but only for node. There is a `.nvmrc` file on the root of the project that specified the version of node required by the project.

With ruby you can install `rubyenv` which the the `nvm` equivalent for the Ruby programming language.

You can also ignore all of this and do a single global installation of Node (via the script on their website) and ruby (via homebrew), yarn (via w/e you want), but you will have a lot of pain when switching projects or updating them.

You will also need to enable `corepack` to use yarn 4.1.1 without a global installation:

```sh
corepack enable yarn
```

## Things you need to manually install

Some stuff cannot be encapsulated and need global installation

- XCode, download it from the apple store, open it, agree to the terms, etc.
- Android SDK, the easiest way to set this up is installing Android Studio, it will install the SDK in a default location for you. Aditionally you can select the Zulu JDK that is a optimized for ARM version that will speed up Android compilation (You do this from inside Android Studio)

> Do not forget to add the ANDROID_HOME variable to your .zshrc (or whatever terminal emulator you are using). You will needed later in some Android compilation steps

## Bundler, cocoapods

Once you got those basic dependencies set up (namely Ruby), you need to globally install the bundler gem:

```
sudo gem install bundler
```

Bundler is the dependency manager for ruby. Once that is installed, in the root of the example project you need to do a:

```
bundle install
```

This will install cocoapods in the local environment for you. You could install Cocoapods as a global dependencies (sudo gem install cocoapods) but then every one in the team will have conflicts once the versions start to differ.

## Actually installing the dependencies

Once everything is correctly set up, you can finally install the javascript dependencies (via yarn) and the iOS native dependencies (via CocoaPods), Android does not require installing the native dependencies, it will be done at build time via Gradle magic.

In the root of this project you can do a simple `yarn`, it is set up in a way that will install the top level dependencies and also the dependencies in the `example` folder.

For the Cocoapods dependencies, my recommended way is that you go into the `example` directory and run `npx pod-install`. Npx is the headless runner of npm, it allows you to run npm packages without having to install them first.

Once everything is done and said, you can run the app. Got to the `example` folder and run `npx react-native start --reset-cache` to start the Metro bundler and development server. Then on a separate terminal in the same `example` folder, start the iOS or Android apps via `yarn ios` or `yarn android`.

If you see any erros that resembles `CocoaPods could not find compatible versions for pod "LucraSDK"` check the `example/ios/Podfile.lock` to see if correct SDK version is defined. If not, run `pod update` from the example folder, or if that does not work, delete the `Podfile.lock` as well as pod folder in the `example/ios` then run `npx pod-install` from the example folder.

## Local Integration Mode

For development and testing with local SDK builds, you can use the automated script to build and integrate local SDKs.

### Setup (One-time)

1. **Copy the template files:**
   ```sh
   cp local-integration.properties.example local-integration.properties
   cp scripts/test-native-sdks-locally.sh.example scripts/test-native-sdks-locally.sh
   ```

2. **Configure your local paths:**
   Edit `scripts/test-native-sdks-locally.sh` and set your project directories:
   ```bash
   LUCRA_ANDROID_DIR="/path/to/your/lucra-android"
   LUCRA_IOS_DIR="/path/to/your/lucra-ios"
   ```

### Usage

Run the automated script:
```sh
./scripts/test-native-sdks-locally.sh
```

The script will prompt you to:
- Select platform(s) to integrate: iOS only, Android only, Both, or None (revert to remote)
- Automatically build and publish the SDKs locally
- Update the `local-integration.properties` file
- Clean up iOS build artifacts as needed

### Manual Configuration

You can also manually edit `local-integration.properties`:

```properties
enableLocalIntegrationModeiOS=true        # Uses xcframeworks/ directory
enableLocalIntegrationModeAndroid=true    # Uses ~/.m2/repository (mavenLocal)
```

**iOS**: When enabled, the podspec will use the local xcframeworks in the `xcframeworks/` directory instead of fetching `LucraSDK` from remote repositories.

**Android**: When enabled, Gradle will use `mavenLocal()` (typically `~/.m2/repository`) to resolve the Lucra SDK artifacts instead of GitHub Packages. This also skips the GPR_USER and GPR_KEY validation.

Set both flags to `false` (default) to use the standard remote dependencies.

## Checks

A bunch of automated checks will run, but you should install prettier on your environment so the ts source code is automatically linted for you.
