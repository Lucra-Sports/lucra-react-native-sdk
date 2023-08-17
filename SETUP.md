# Setting up your machine to develop react-native apps

React Native depends on several frameworks and dependencies you need to setup, some locally some globally

## With ASDF

[ASDF](https://asdf-vm.com/) is a runtime framework manager, it allows you to have a local-bound installation of global tooling, therefore no need to mess up your projects when they have disparate dependency versions.

You can follow the installation instructions on the website. This repo already contains a `.tool-versions` file that specified the required dependencies:

```
nodejs 18.15.0
ruby 2.7.6
yarn 1.22.19
java zulu-11.56.19
```

With ASDF installed on your machine, you can then navigate to the root of this project and do:

```sh
asdf install
```

Then use the commands normally

## With nvm, rubyenv and global installs

If ASDF is not your cup of tea, you will be forced to install the dependencies in however way you prefer. However certain tooling will help you.

`nvm` is ASDF but only for node. There is a `.nvmrc` file on the root of the project that specified the version of node required by the project.

With ruby you can install `rubyenv` which the the `nvm` equivalent for the Ruby programming language.

You will need to install both and install the versions required by this project to get them running. Once node is installed you should install `yarn` as well. The recommended way is via script, but I do `npm install -g yarn` and it works just fine.

You can also ignore all of this and do a single global installation of Node (via the script on their website) and ruby (via homebrew), yarn (via w/e you want), but you will have a lot of pain when switching projects or updating them.

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

For the Cocoapods dependencies, my recommended way is that you go into the `example` directory and run `npx pod-install`. Npx is the headless runner of npm, it allows you to run npm packages without having to install them first. The `pod-install` is a JS wrapper for CocoaPods created by the community that takes care of many pitfalls of directly using `CocoaPods` when one is not a ruby/iOS expert.

Once everything is done and said, you can return to the root folder and run the app via `yarn build:ios` or `yarn build:android` or stay in the `example` folder and run the app like a normal RN app via `yarn ios` or `yarn android`.
