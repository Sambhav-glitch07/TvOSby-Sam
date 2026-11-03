import JSZip from 'jszip';

export interface AndroidFile {
  path: string;
  name: string;
  category: 'workflow' | 'gradle' | 'manifest' | 'kotlin' | 'layout' | 'resource' | 'docs';
  language: string;
  content: string;
}

export const GITHUB_WORKFLOW_CONTENT = `name: Build Sambhav TV OS Debug APK

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    name: Build Android TV Launcher APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: Grant Execute Permission for Gradlew
        run: chmod +x gradlew

      - name: Build Debug APK with Gradle
        run: ./gradlew assembleDebug --stacktrace --no-daemon

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: Sambhav-TV-OS-Launcher-Debug-APK
          path: app/build/outputs/apk/debug/*.apk
          if-no-files-found: error
          retention-days: 14
`;

export const GRADLEW_SH_CONTENT = `#!/bin/sh

app_path=$0
while [ -h "$app_path" ]; do
    ls=$(ls -ld "$app_path")
    link=$(expr "$ls" : '.*-> \\(.*\\)$')
    if expr "$link" : '/.*' > /dev/null; then
        app_path="$link"
    else
        app_path=$(dirname "$app_path")"/$link"
    fi
done

APP_BASE_NAME=\${0##*/}
APP_HOME=$(cd -P "$(dirname "$app_path")" && pwd -P) || exit

DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'
MAX_FD=maximum

warn () {
    echo "$*"
} >&2

die () {
    echo
    echo "$*"
    echo
    exit 1
} >&2

cygwin=false
msys=false
darwin=false
nonstop=false
case "$(uname)" in
  CYGWIN* ) cygwin=true ;;
  Darwin* ) darwin=true ;;
  MINGW* ) msys=true ;;
  NONSTOP* ) nonstop=true ;;
esac

CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar

if [ -n "$JAVA_HOME" ] ; then
    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
        JAVACMD=$JAVA_HOME/jre/sh/java
    else
        JAVACMD=$JAVA_HOME/bin/java
    fi
    if [ ! -x "$JAVACMD" ] ; then
        die "ERROR: JAVA_HOME is set to an invalid directory: $JAVA_HOME"
    fi
else
    JAVACMD=java
    which java >/dev/null 2>&1 || die "ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH."
fi

eval set -- $DEFAULT_JVM_OPTS $JAVA_OPTS $GRADLE_OPTS "\\"-Dorg.gradle.appname=$APP_BASE_NAME\\"" -classpath "\\"$CLASSPATH\\"" org.gradle.wrapper.GradleWrapperMain '"$@"'

exec "$JAVACMD" "$@"
`;

export const GRADLEW_BAT_CONTENT = `@if "%DEBUG%" == "" @echo off
@rem Gradle startup script for Windows
set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

for %%i in ("%APP_HOME%") do set APP_HOME=%%~fsi

set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"

if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto execute

echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto execute

echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
goto fail

:execute
set CLASSPATH=%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*

:fail
exit /b 1
`;

export const ROOT_BUILD_GRADLE = `plugins {
    id 'com.android.application' version '8.7.3' apply false
    id 'org.jetbrains.kotlin.android' version '2.0.21' apply false
}

tasks.register('clean', Delete) {
    delete rootProject.layout.buildDirectory
}
`;

export const SETTINGS_GRADLE = `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "SambhavTvOsLauncher"
include ':app'
`;

export const GRADLE_PROPERTIES = `org.gradle.jvmargs=-Xmx3072m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`;

export const GRADLE_WRAPPER_PROPERTIES = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;

export const APP_BUILD_GRADLE = `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'tv.sambhav.os.launcher'
    compileSdk 34

    defaultConfig {
        applicationId "tv.sambhav.os.launcher"
        minSdk 28
        targetSdk 34
        versionCode 100
        versionName "1.0.0-cinematic"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            shrinkResources false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = '17'
    }

    buildFeatures {
        viewBinding false
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.13.1'
    implementation 'androidx.appcompat:appcompat:1.7.0'
    implementation 'androidx.leanback:leanback:1.0.0'
    implementation 'androidx.recyclerview:recyclerview:1.3.2'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.cardview:cardview:1.0.0'
    implementation 'com.google.android.material:material:1.12.0'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1'
}
`;

export const ANDROID_MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="tv.sambhav.os.launcher">

    <!-- TV Launcher Hardware Features -->
    <uses-feature
        android:name="android.software.leanback"
        android:required="false" />
    <uses-feature
        android:name="android.hardware.touchscreen"
        android:required="false" />
    <uses-feature
        android:name="android.hardware.microphone"
        android:required="false" />

    <!-- Query packages on Android 11+ (API 30+) while maintaining API 28 backwards compatibility -->
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES"
        tools:ignore="QueryAllPackagesPermission" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <application
        android:allowBackup="true"
        android:icon="@drawable/ic_sambhav_logo"
        android:label="@string/app_name"
        android:banner="@drawable/ic_tv_banner"
        android:supportsRtl="true"
        android:theme="@style/Theme.SambhavTvOs"
        android:hardwareAccelerated="true"
        android:largeHeap="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:clearTaskOnLaunch="true"
            android:stateNotNeeded="true"
            android:screenOrientation="landscape"
            android:configChanges="keyboard|keyboardHidden|navigation|orientation|screenLayout|screenSize|smallestScreenSize">

            <!-- Default System Launcher -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.HOME" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>

            <!-- Android TV Leanback Launcher -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
            </intent-filter>
        </activity>

        <receiver
            android:name=".receiver.PackageChangeReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.PACKAGE_ADDED" />
                <action android:name="android.intent.action.PACKAGE_REMOVED" />
                <action android:name="android.intent.action.PACKAGE_REPLACED" />
                <data android:scheme="package" />
            </intent-filter>
        </receiver>

    </application>

</manifest>
`;

export const README_MD = `# Sambhav TV OS - Premium Android TV Launcher

Flagship Apple tvOS-inspired glass interface launcher engineered specifically for **TCL Smart TV** running **Android 9 (API 28)**.

## Highlights
- **Apple tvOS-inspired Glass Architecture**: Dual-layer specular highlights, Fresnel gloss gradients, and ambient lighting bloom.
- **Hardware D-Pad Remote Navigation**: Native focus scale (1.08x), directional focus traversal, elevation Z-indexing, and memory restoration.
- **Leanback Launcher Integration**: Configured with \`CATEGORY_HOME\` and \`CATEGORY_LEANBACK_LAUNCHER\`.
- **Automatic App Discovery**: Discovers both Leanback TV apps and standard Android apps via \`PackageManager\`, categorizing and launching them with intent fallbacks.
- **TCL Hardware Input Management**: Control HDMI 1 (eARC), HDMI 2, HDMI 3, and AV inputs via Android TV Input Framework.
- **Built for Android 9 Pie (API 28)**: High-performance Views (no Compose overhead), optimized for 1GB/2GB TV SoCs.

## Building with GitHub Actions
This project includes a pre-configured \`.github/workflows/build.yml\`.
1. Push this repository to GitHub.
2. The workflow will automatically run:
   - JDK 17 (Temurin)
   - Gradle 8.9 & Android Gradle Plugin 8.7.3
   - Command: \`./gradlew assembleDebug\`
3. Download the generated \`app-debug.apk\` from GitHub Actions artifacts and install on your TCL Android TV!

## Building Locally in Android Studio
1. Open this directory in **Android Studio Ladybug (2024.2+)** or newer.
2. Select **JDK 17** in Settings > Build, Execution, Deployment > Build Tools > Gradle.
3. Sync Gradle and press **Run** or execute \`./gradlew assembleDebug\` in the terminal.
4. Output APK is placed in \`app/build/outputs/apk/debug/app-debug.apk\`.
`;

export async function downloadAndroidProjectZip(mainActivityCode: string) {
  const zip = new JSZip();

  // Root files
  zip.file('.github/workflows/build.yml', GITHUB_WORKFLOW_CONTENT);
  zip.file('gradlew', GRADLEW_SH_CONTENT, { unixPermissions: '755' });
  zip.file('gradlew.bat', GRADLEW_BAT_CONTENT);
  zip.file('build.gradle', ROOT_BUILD_GRADLE);
  zip.file('settings.gradle', SETTINGS_GRADLE);
  zip.file('gradle.properties', GRADLE_PROPERTIES);
  zip.file('gradle/wrapper/gradle-wrapper.properties', GRADLE_WRAPPER_PROPERTIES);
  zip.file('README.md', README_MD);

  // App module
  zip.file('app/build.gradle', APP_BUILD_GRADLE);
  zip.file('app/proguard-rules.pro', '-keep class tv.sambhav.os.launcher.** { *; }\n');
  zip.file('app/src/main/AndroidManifest.xml', ANDROID_MANIFEST);

  // Res values
  zip.file(
    'app/src/main/res/values/colors.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="tv_bg_obsidian">#FF05070A</color>
    <color name="tv_bg_charcoal">#FF0F131A</color>
    <color name="tv_bg_surface">#FF161B24</color>
    <color name="tv_glass_surface_idle">#1CFFFFFF</color>
    <color name="tv_glass_surface_focused">#E6FFFFFF</color>
    <color name="tv_glass_border_focused">#F2FFFFFF</color>
    <color name="tv_text_primary">#FFF9FAFB</color>
    <color name="tv_text_secondary">#9CA3AF</color>
    <color name="tv_text_tertiary">#6B7280</color>
    <color name="tv_text_dark">#FF0A0D12</color>
    <color name="tv_accent_emerald">#34D399</color>
</resources>`
  );

  zip.file(
    'app/src/main/res/values/strings.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Sambhav TV OS</string>
    <string name="sambhav_brand">SAMBHAV</string>
    <string name="tab_home">Home</string>
    <string name="tab_movies">Movies</string>
    <string name="tab_shows">Shows</string>
    <string name="tab_apps">Apps</string>
    <string name="tab_settings">Settings</string>
    <string name="section_quick_launch">Recent Applications</string>
    <string name="section_featured_cinematic">Featured Cinematic Releases</string>
    <string name="section_installed_apps">Television Applications</string>
    <string name="section_sambhav_originals">Sambhav Originals &amp; 4K HDR</string>
    <string name="section_settings_tcl">TCL System &amp; Inputs</string>
</resources>`
  );

  zip.file(
    'app/src/main/res/values/styles.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.SambhavTvOs" parent="Theme.AppCompat.NoActionBar">
        <item name="android:windowBackground">@color/tv_bg_obsidian</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowOverscan">false</item>
        <item name="android:windowContentOverlay">@null</item>
    </style>
</resources>`
  );

  // Drawables
  zip.file(
    'app/src/main/res/drawable/ic_sambhav_logo.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="48dp"
    android:height="48dp"
    android:viewportWidth="48"
    android:viewportHeight="48">
    <path android:fillColor="#FFFFFFFF" android:pathData="M24,4 L40,13.2 L40,34.8 L24,44 L8,34.8 L8,13.2 Z" android:fillAlpha="0.1" />
    <path android:strokeColor="#FFFFFFFF" android:strokeWidth="2.5" android:strokeLineJoin="round" android:strokeLineCap="round" android:pathData="M24,4 L40,13.2 L40,34.8 L24,44 L8,34.8 L8,13.2 Z" />
    <path android:fillColor="#FFFFFFFF" android:pathData="M21,17 L31,24 L21,31 Z" />
</vector>`
  );

  zip.file(
    'app/src/main/res/drawable/ic_tv_banner.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="320dp"
    android:height="180dp"
    android:viewportWidth="320"
    android:viewportHeight="180">
    <path android:fillColor="#FF0F131A" android:pathData="M0,0 h320 v180 h-320 Z" />
    <path android:strokeColor="#FFFFFFFF" android:strokeWidth="3" android:pathData="M160,40 L210,68 L210,124 L160,152 L110,124 L110,68 Z" />
    <path android:fillColor="#FFFFFFFF" android:pathData="M152,78 L176,96 L152,114 Z" />
</vector>`
  );

  // MainActivity
  zip.file('app/src/main/java/tv/sambhav/os/launcher/MainActivity.kt', mainActivityCode);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sambhav-tvos-launcher-ready-to-build.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
