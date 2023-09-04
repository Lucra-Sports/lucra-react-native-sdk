# Lucra SDK

## Getting Started

### Gradle setup

In your project's `build.gradle` add the following and replace the credentials with your provided PAT and your username

```gradle
    repositories {
        google()
        mavenCentral()
        maven { setUrl("https://jitpack.io") }
        maven(url = "https://zendesk.jfrog.io/zendesk/repo")
        maven {
            name = "LucraGithubPackages"
            url = uri("https://maven.pkg.github.com/Lucra-Sports/lucra-android")
            credentials {
                username = {YOUR_GITHUB_USERNAME}
                password = {YOUR_GITHUB_LUCRA_PAT}
            }
        }
    }
```

In `app/build.gradle`

```gradle 
// All surface level APIs to interact with Lucra
implementation("com.lucrasports:sdk-core:1.0.1-alpha") //TODO reference latest github release #
// Optional for UI functionality
implementation("com.lucrasports:sdk-ui:1.0.1-alpha") //TODO reference latest github release #
```

#### Auth0 compliance (if not already using Auth0)

We use Auth0 for auth, if your app doesn't use it already, add the following to your app's default config.

Gradle.kts

```gradle.kts
android{
    defaultConfig {
        addManifestPlaceholders(mapOf("auth0Domain" to "LUCRA_SDK", "auth0Scheme" to "LUCRA_SDK"))
    }
}
```

Groovy

```groovy
manifestPlaceholders = [
                'auth0Domain': 'LUCRA_SDK',
                'auth0Scheme': 'LUCRA_SDK'
        ]
```


### Manifest Requirements

The following manifest permissions, features, receivers and services are required to use Lucra

```xml

<manifest xmlns:android="http://schemas.android.com/apk/res/android">
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

### Proguard Requirements

```
#https://issuetracker.google.com/issues/247066506
-dontwarn org.xmlpull.v1.**
-dontwarn org.kxml2.io.**
-dontwarn android.content.res.**
-dontwarn org.slf4j.impl.StaticLoggerBinder
-keep class org.xmlpull.** { *; }
-keepclassmembers class org.xmlpull.** { *; }
```

### Application Requirements

Lucra leverages [Coil](https://coil-kt.github.io/coil/) to render images and SVGs. In your
application class, provider the LucraCoilImageLoader

```kotlin
// Don't forget to set the app manifest to use this Application
class MyApplication : Application(), ImageLoaderFactory {
    // Use Lucra's ImageLoader to decode SVGs as needed
    override fun newImageLoader() = LucraCoilImageLoader.get(this)
}

```

### Initialization

In your application class, initialize the Lucra instance in `onCreate`.

```kotlin
LucraClient.initialize(
    // Required - provide Auth0 client ID to use for authorization
    authClientId = "your client id",
    // Required - set the listener for the instance
    lucraClientListener = object : LucraClientListener {
        fun onLucraExit() {
            // Handle Lucra attempt to exit flow
        }
    },
    // Optionally provide LucraUiProvider implementation from "com.lucrasports:sdk-ui:*"
    lucraUiProvider = LucraUi(),
    // Optionally provide Lucra.Logger implementation to track events happening through the experience
    customLogger = null,
    // Optionally provide environment to use, defaults to Environment.PRODUCTION
    environment = Environment.DEVELOPMENT,
    // Optionally specify to output logs to Logcat, defaults to false
    outputLogs = true
)
```

### Interacting with APIs

TODO: add all method interactions

Use Lucra instance easily by invoking the class operator `LucraClient().*` or fetching the
instance `LucraClient.getInstance().*`

### UI styling

TODO:

### Showing full Lucra flow

Launch the LucraFragment in your Activity or Fragment by passing in a LucraFlow. The following flows
are supported:

`LucraUiProvider.LucraFlow.VerifyIdentity`
Launch the verify identity flow for users

`LucraUiProvider.LucraFlow.AddFunds`
Launch the add funds flow for users, identity verification will launch if the user hasn't verified
their identity yet

`LucraUiProvider.LucraFlow.CreateGamesMatchup`
Launch the create games matchup flow, identity verification will launch if the user hasn't verified
their identity yet

`LucraUiProvider.LucraFlow.Profile`
Launch the profile view for users to add and withdrawal funds, identity verification will launch if
the user hasn't verified their identity yet

```kotlin
supportFragmentManager.beginTransaction()
    .add(
        R.id.lucraFragment,
        LucraClient().getLucraFragment(LucraUiProvider.LucraFlow.Profile),
        "LucraFragmentTag"
    )
    .commit()
```

```kotlin
// Or use the LucraDialogFragment to show the flow in a dialog
val lucraDialog = LucraClient().getLucraDialogFragment(lucraFlow)
lucraDialog.show(supportFragmentManager, LUCRA_FRAGMENT_TAG)
```


