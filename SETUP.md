# Setup & Run Guide

## Prerequisites

### Node.js (v18 or higher)

Download and install from [https://nodejs.org](https://nodejs.org).

Verify installation:
```bash
node --version
# Expected: v18.x.x or higher

npm --version
# Expected: 9.x.x or higher
```

---

### Java JDK 17

React Native 0.73 requires **JDK 17** specifically (not 11, not 21).

Download from [https://adoptium.net](https://adoptium.net) — choose **Temurin 17**.

After installing, set environment variables:

| Variable | Value |
|---|---|
| `JAVA_HOME` | `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot` |
| `PATH` (append) | `%JAVA_HOME%\bin` |

Verify:
```bash
java -version
# Expected: openjdk version "17.x.x" ...

javac -version
# Expected: javac 17.x.x

echo %JAVA_HOME%
# Expected: C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot
```

---

### Android Studio

Download from [https://developer.android.com/studio](https://developer.android.com/studio).

During installation, make sure these components are selected:

- Android SDK (API **35**)
- Android SDK Build-Tools **34.0.0**
- NDK version **25.1.8937393**
- Android Emulator

> To install the NDK: Android Studio → SDK Manager → **SDK Tools** tab → check **NDK (Side by side)** → select version `25.1.8937393`.

After installing, set environment variables:

| Variable | Value |
|---|---|
| `ANDROID_HOME` | `C:\Users\<YourName>\AppData\Local\Android\Sdk` |
| `PATH` (append) | `%ANDROID_HOME%\emulator` |
| `PATH` (append) | `%ANDROID_HOME%\platform-tools` |
| `PATH` (append) | `%ANDROID_HOME%\cmdline-tools\latest\bin` |

Verify:
```bash
adb --version
# Expected: Android Debug Bridge version 1.x.x

sdkmanager --version
# Expected: a version number like 12.0

echo %ANDROID_HOME%
# Expected: C:\Users\<YourName>\AppData\Local\Android\Sdk

# List installed SDK packages (confirms SDK, build-tools, NDK are present)
sdkmanager --list_installed
# Look for lines containing:
#   build-tools;34.0.0
#   ndk;25.1.8937393
#   platforms;android-35
```

---

### Verify All Prerequisites at Once

Run all checks in one go to confirm everything is ready:

```bash
node --version && npm --version && java -version && adb --version
# All four should print version numbers without errors
```

---

## Project Setup

### 1. Open the project

```bash
cd "D:\AB Repo\ai-video-player-language-converter"

# Confirm you are in the right directory
ls
# Should show: android/  src/  package.json  index.js  etc.
```

### 2. Install dependencies

```bash
npm install

# Verify node_modules were created
ls node_modules | head -5
# Should list several package folders
```

### 3. Create the debug keystore (first time only)

```bash
# Check if it already exists first
ls android/app/debug.keystore

# If not found, create it:
cd android/app
keytool -genkey -v -keystore debug.keystore -alias androiddebugkey \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass android -keypass android \
  -dname "CN=Android Debug"
cd ../..

# Verify it was created
ls -lh android/app/debug.keystore
# Should show a file ~2-3 KB
```

### 4. Create `android/local.properties` (if missing)

```bash
# Check if it already exists
ls android/local.properties
```

If not found, create the file `android/local.properties` with this content (adjust path to your machine):

```
sdk.dir=C\:\\Users\\<YourName>\\AppData\\Local\\Android\\Sdk
```

Verify the path inside it is correct:
```bash
cat android/local.properties
# Expected: sdk.dir=C\:\\Users\\<YourName>\\AppData\\Local\\Android\\Sdk
```

---

## Connect a Device or Start an Emulator

### Option A — Physical Android phone

1. On your phone: **Settings → About phone → tap Build number 7 times** to unlock Developer Options.
2. Go to **Settings → Developer Options** and enable **USB Debugging**.
3. Connect the phone via USB cable and accept the RSA fingerprint prompt on the phone.
4. Verify the device is detected:
   ```bash
   adb devices
   # Expected output:
   # List of devices attached
   # R5CX123ABC   device
   #
   # If it shows "unauthorized" — accept the prompt on the phone and retry.
   # If list is empty — replug the cable or run: adb kill-server && adb start-server

   # Check device Android version
   adb shell getprop ro.build.version.release
   # Expected: 10, 11, 12, 13, or 14

   # Check device architecture (useful for APK compatibility)
   adb shell getprop ro.product.cpu.abi
   # Expected: arm64-v8a (most modern phones)
   ```

### Option B — Android Emulator

1. Open Android Studio → **Device Manager** (right toolbar).
2. Click **Create Device** → choose a phone profile (e.g., Pixel 6).
3. Select a system image with API **34** or higher → download if needed.
4. Click **Finish**, then click the **Play** button to start the emulator.
5. Verify it appears:
   ```bash
   adb devices
   # Expected:
   # List of devices attached
   # emulator-5554   device

   # Start a specific emulator from the command line (alternative to Android Studio UI)
   emulator -list-avds
   # Lists all available virtual devices, e.g.: Pixel_6_API_34

   emulator -avd Pixel_6_API_34
   # Starts that emulator (run this in a separate terminal, keep it open)
   ```

---

## Run the Application

Open **two separate terminal windows** in the project root.

### Terminal 1 — Start Metro bundler

```bash
npm start

# You should see:
#  BUNDLE  ./index.js
#  Metro waiting on http://localhost:8081
```

Keep this running. Metro serves the JavaScript bundle to the app.

### Terminal 2 — Build and install on device

```bash
npm run android

# This runs: react-native run-android
# First build takes 3-10 minutes (Gradle downloads dependencies).
# Subsequent builds are much faster.
#
# You should see near the end:
#   BUILD SUCCESSFUL in Xs
#   Installing APK ...
#   Launched activity com.aivideoplayer/...MainActivity
```

Check the installed APK on your device:
```bash
# Confirm APK is installed
adb shell pm list packages | grep aivideoplayer
# Expected: package:com.aivideoplayer

# Check APK install path
adb shell pm path com.aivideoplayer
# Expected: package:/data/app/com.aivideoplayer-xxx/base.apk

# Launch the app manually (if it doesn't open automatically)
adb shell am start -n com.aivideoplayer/.MainActivity
```

---

## First Launch

On the first launch, the app will request permissions:

1. **Storage / Media access** — tap **Allow**. Required to scan device storage for video files.
2. **Modify system settings** (brightness control) — if prompted, the app opens the Android settings page; toggle **Allow modifying system settings** on for this app.

Once permissions are granted, the app scans your device storage (up to 2 folder levels deep) and groups found videos by folder. Tap a folder to see the videos inside, then tap a video to play it.

Check current app permissions via ADB:
```bash
adb shell dumpsys package com.aivideoplayer | grep permission
# Look for: READ_MEDIA_VIDEO or READ_EXTERNAL_STORAGE showing as "granted=true"
```

---

## Useful Commands

```bash
# Type-check TypeScript without building
npm run tsc
# No output = no errors

# Run ESLint
npm run lint

# Run all tests
npm test

# Run a single test file
npx jest src/hooks/useVideoFiles.test.ts

# Clear Metro cache (fixes stale bundle issues)
npm start -- --reset-cache

# Clean Gradle build cache
cd android && ./gradlew clean && cd ..

# Full clean + reinstall (nuclear option for persistent build issues)
cd android && ./gradlew clean && cd .. && npm install && npm run android

# View live app logs (useful for debugging)
adb logcat --pid=$(adb shell pidof -s com.aivideoplayer)

# View only React Native logs
adb logcat -s ReactNativeJS

# Uninstall the app from device
adb uninstall com.aivideoplayer

# Check Gradle version used by the project
cd android && ./gradlew --version && cd ..

# Check React Native environment health
npx react-native doctor
```

---

## Troubleshooting

| Problem | Diagnostic Command | Solution |
|---|---|---|
| `SDK location not found` | `cat android/local.properties` | Create `android/local.properties` with `sdk.dir=C\:\\Users\\<YourName>\\AppData\\Local\\Android\\Sdk` |
| `NDK not configured` | `sdkmanager --list_installed \| grep ndk` | Install NDK `25.1.8937393` via Android Studio SDK Manager → SDK Tools |
| `adb: no devices/emulators found` | `adb devices` | Run `adb kill-server && adb start-server`, replug USB or restart emulator |
| `JAVA_HOME not set` | `echo %JAVA_HOME%` | Set `JAVA_HOME` to your JDK 17 installation directory and restart terminal |
| Wrong Java version | `java -version` | Ensure JDK 17 is installed and `JAVA_HOME` points to it, not another version |
| Metro bundle error on launch | `adb logcat -s ReactNativeJS` | Run `npm start -- --reset-cache` in Terminal 1 |
| Gradle build fails | `cd android && ./gradlew clean && cd ..` | Clean then retry `npm run android` |
| App installed but blank/white screen | `adb logcat -s ReactNativeJS` | Ensure Metro is running in Terminal 1 before launching the app |
| Permission denied on storage scan | `adb shell dumpsys package com.aivideoplayer \| grep permission` | Go to **Settings → Apps → AI Video Player → Permissions** and grant Storage/Files |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | `adb shell pm list packages \| grep aivideoplayer` | Uninstall first: `adb uninstall com.aivideoplayer` then retry |
| Port 8081 already in use | `netstat -ano \| findstr :8081` | Kill the process using that PID or run Metro on another port: `npm start -- --port 8082` |
