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
    outputLogs = true,
    // Optionally add your own color scheme and fonts, defaults to the Lucra Defaults
    clientTheme = ClientTheme(
      colorStyle = ColorStyle(),
      fontFamily = FontFamily()
    )
)
```

### Interacting with APIs

Use Lucra instance easily by invoking the class operator `LucraClient().*` or fetching the
instance `LucraClient.getInstance().*`

Once you have the instance, you can interact with our SDK interfaces:

### GamesMatchup API

The GamesMatchup interface provides methods to manage game contests. It allows users to create, accept, and cancel contests. Each method provides a callback mechanism to handle the result of the operation.

**Methods**

`createGamesMatchup`

Creates a new game contest.

- **Parameters:**
  - `gameTypeId`: ID associated with the game type.
  - `atStake`: Amount of money being wagered.
  - `onResult`: Callback with a result of type `CreateGamesMatchupResult`.

- **Example usage:**
```kotlin
gamesMatchup.createGamesMatchup(
    gameTypeId = "gameTypeId",
    atStake = 25.0
) { result ->
    when (result) {
        is CreateGamesMatchupResult.Failure -> {
            // Handle failure scenario
        }
        is CreateGamesMatchupResult.GYPCreatedMatchupOutput -> {
            // Handle success scenario
        }
    }
}
```

`acceptGamesMatchup`

Accepts a contest with the given ID.

- **Parameters:**
  - `matchupId`: ID of the contest.
  - `teamId`: ID of the team the user wants to join.
  - `onResult`: Callback with a result of type `MatchupActionResult`.

- **Example usage:**
```kotlin
gamesMatchup.acceptGamesMatchup(
    matchupId = "matchupId",
    teamId = "teamId"
) { result ->
    when (result) {
        is MatchupActionResult.Failure -> {
            // Handle failure scenario
        }
        MatchupActionResult.Success -> {
            // Handle success scenario
        }
    }
}
```

`cancelGamesMatchup`

Cancels a contest with the given ID.

- **Parameters:**
  - `matchupId`: ID of the contest.
  - `onResult`: Callback with a result of type `MatchupActionResult`.

- **Example usage:**
```kotlin
gamesMatchup.cancelGamesMatchup(matchupId = "matchupId") { result ->
    when (result) {
        is MatchupActionResult.Failure -> {
            // Handle failure scenario
        }
        MatchupActionResult.Success -> {
            // Handle success scenario
        }
    }
}
```

**Result Types**

`MatchupActionResult`

Represents the result of an operation on an existing `GamesMatchup`.

- `Success`: Represents a successful operation.
- `Failure`: Represents a failed operation. Contains a `failure` of type `FailedCreateGamesMatchup`.

`CreateGamesMatchupResult`

Represents the result of creating a `GamesMatchup`.

- `GYPCreatedMatchupOutput`: Represents a successfully created matchup. Contains `matchupId`, `ownerTeamId`, and `opponentTeamId`.
- `Failure`: Represents a failed operation. Contains a `failure` of type `FailedCreateGamesMatchup`.

**Error Types**

`FailedCreateGamesMatchup`

Represents the types of errors that can occur when creating a `GamesMatchup`.

- `UserStateError`: Errors related to the current user account status or available funds.
  - `NotInitialized`: User account is not initialized.
  - `Unverified`: User account is unverified.
  - `NotAllowed`: User is not allowed to perform the operation.
  - `InsufficientFunds`: User has insufficient funds.
- `LocationError`: Errors related to the user's location. Contains a `message`.
- `APIError`: All other errors. Contains a `message`.


### UI styling

Your can customize your Lucra implementation with your own color scheme and fonts by providing the `ClientTheme` object to `LucraClient`.

The `ClientTheme` class has two nested classes, `ColorStyle` and `FontFamily`.


`ColorStyle` represents the 10 different colors your can provide to the SDK. Each field in this class is an hexadecimal string value.

The colors used are `Primary`, `Secondary`, `Tertiary`, `Surface`, `Background`, `OnPrimary`, `OnSecondary`, `OnTertiary`, `OnSurface`, `OnBackground`


`FontFamily` represents a list of custom text styles you can apply to the SDK. Each text style is represented by a `Font` object.

Each `Font` object requires you to specify the `fontName` and `weight`. 

The `fontName` is the exact file name of your custom font excluding the file extension (so the correct `fontName` would be `wingding` and not `wingding.ttf`).
These fonts are imported through Reach Native. 

The `weight` is a enum representing the font weight associated with the imported font. 
Lucra provides 4 FontWeight options, `FontWeight.Bold`, `FontWeight.SemiBold`, `FontWeight.Normal`, and `FontWeight.Medium`.
It is recommended that you include all 4 font weights.

```kotlin

 LucraClient.initialize(
  /*...*/
  clientTheme = ClientTheme(
    colorStyle = ColorStyle(
      primary = "#1976D2",
      secondary = "#F57C00",
      tertiary = "#388E3C",
      surface = "#FFFFFF",
      background = "#F5F5F5",
      onPrimary = "#FFFFFF",
      onSecondary = "#FFFFFF",
      onTertiary = "#FFFFFF",
      onSurface = "#000000",
      onBackground = "#000000"
    ),
    fontFamily = FontFamily(
      listOf(
        Font(
          fontName = "my_font_bold",
          weight = FontWeight.Bold
        ),
        Font(
          fontName = "my_font",
          weight = FontWeight.Normal
        )
      )
    )
  )
)
```

### Showing full Lucra flow

Launch the LucraFragment in your Activity or Fragment by passing in a LucraFlow. The following flows
are supported:

`LucraUiProvider.LucraFlow.VerifyIdentity`
Launch the verify identity flow for users

`LucraUiProvider.LucraFlow.AddFunds`
Launch the add funds flow for users, identity verification will launch if the user hasn't verified
their identity yet

`LucraUiProvider.LucraFlow.WithdrawFunds`
Launch the withdraw funds flow for users, identity verification will launch if the user hasn't verified
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


