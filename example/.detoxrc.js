/** @type {Detox.DetoxConfig} */
module.exports = {
  logger: {
    level: 'trace',
  },
  artifacts: {
    plugins: {
      screenshot: {
        enabled: true,
        keepOnlyFailedTestsArtifacts: false,
        shouldTakeAutomaticSnapshots: true,
        takeWhen: {
          testDone: true,
          testFailure: true,
          testStart: false,
          appNotReady: true,
        },
      },
    },
  },
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Debug-iphonesimulator/LucrasdkExample.app',
      build:
        'xcodebuild -workspace ios/LucrasdkExample.xcworkspace -scheme LucrasdkExample -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081],
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 16',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Medium_Phone_API_34',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};
