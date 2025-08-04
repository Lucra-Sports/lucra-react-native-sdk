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

## Checks

A bunch of automated checks will run, but you should install prettier on your environment so the ts source code is automatically linted for you.
