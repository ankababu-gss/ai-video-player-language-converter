# Setup & Run Guide

This guide covers a full local setup from a fresh clone to a running app on an Android emulator or device. Follow every step in order to avoid known issues.

---

## 1. Prerequisites

### Node.js (v18 or higher)

Download from [https://nodejs.org](https://nodejs.org). v20 is fine.

```powershell
node --version   # Expected: v18.x.x or higher
npm --version    # Expected: 9.x.x or higher
```

---

### Java JDK 17

React Native 0.73 requires **JDK 17 exactly** (not 11, not 21).

Download **Temurin 17** from [https://adoptium.net](https://adoptium.net).

After installing, set environment variables:

| Variable | Value |
|---|---|
| `JAVA_HOME` | `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot` |
| `PATH` (append) | `%JAVA_HOME%\bin` |

> To find your exact JDK path: `where java` — copy everything before `\bin\java.exe`.

Verify:
```powershell
java -version     # Expected: openjdk version "17.x.x"
javac -version    # Expected: javac 17.x.x
echo $env:JAVA_HOME  # Must print the JDK path, NOT %JAVA_HOME% literally
```

---

### Android Studio

Download from [https://developer.android.com/studio](https://developer.android.com/studio).

During setup, install these components via **SDK Manager → SDK Tools**:

| Component | Version |
|---|---|
| Android SDK Platform | API **35** |
| Android SDK Build-Tools | **34.0.0** |
| NDK (Side by side) | **25.1.8937393** |
| Android Emulator | latest |

> To install NDK: Android Studio → SDK Manager → **SDK Tools** tab → check **NDK (Side by side)** → expand and select `25.1.8937393`.

Set environment variables:

| Variable | Value |
|---|---|
| `ANDROID_HOME` | `C:\Users\<YourName>\AppData\Local\Android\Sdk` |
| `PATH` (append) | `%ANDROID_HOME%\platform-tools` |
| `PATH` (append) | `%ANDROID_HOME%\emulator` |

Verify:
```powershell
adb --version        # Expected: Android Debug Bridge version 1.x.x
echo $env:ANDROID_HOME  # Must print the SDK path
```

> If `adb` is not recognized in a new terminal, run:
> ```powershell
> $env:PATH += ";C:\Users\<YourName>\AppData\Local\Android\Sdk\platform-tools"
> ```

---

## 2. Clone the Repository

```powershell
git clone <repository-url>
cd "ai-video-player-language-converter"
```

---

## 3. Install Dependencies

```powershell
npm install
```

> `react-native-gesture-handler` is pinned to `^2.14.1` in `package.json`. Do **not** upgrade it — newer versions require Android Gradle Plugin 8.6+ which is incompatible with this project's AGP 8.1.1.

---

## 4. Create `android/local.properties`

Check if it exists:
```powershell
ls android/local.properties
```

If not found, create the file `android/local.properties` with this content (adjust to your username):

```
sdk.dir=C\:\\Users\\<YourName>\\AppData\\Local\\Android\\Sdk
```

---

## 5. Allow Metro Through Windows Firewall

Run once (as Administrator or accept the UAC prompt):

```powershell
netsh advfirewall firewall add rule name="Metro 8081" dir=in action=allow protocol=TCP localport=8081
```

> Without this rule, the emulator cannot connect to the Metro bundler on Windows.

---

## 6. Start an Android Emulator

**Option A — Android Studio (recommended):**
1. Open Android Studio → **Device Manager** (right toolbar)
2. Click **Create Device** → choose **Pixel 6** → select **API 34** system image → Finish
3. Click the **Play ▶** button to start

**Option B — Command line:**
```powershell
$env:PATH += ";C:\Users\<YourName>\AppData\Local\Android\Sdk\emulator"
emulator -list-avds          # Lists available virtual devices
emulator -avd Pixel_6_API_34 # Start a specific one (keep this terminal open)
```

Verify the emulator is detected:
```powershell
adb devices
# Expected:
# List of devices attached
# emulator-5554   device
```

---

## 7. Run the App

Open **two separate terminals** in the project root.

### Terminal 1 — Start Metro

```powershell
npm start
```

Wait until you see:
```
info Dev server ready
```

### Terminal 2 — Build and Install

```powershell
npm run android
```

Wait for:
```
BUILD SUCCESSFUL
Installed on 1 device.
```

### Terminal 2 — Forward Metro port to emulator

Run this **after** the app installs (required on Windows):

```powershell
adb reverse tcp:8081 tcp:8081
```

The app will launch automatically. If it shows a connection error, run `adb reverse` again then press `r` in Terminal 1 to reload.

---

## 8. First Launch Permissions

On first open the app requests:

1. **Storage / Media access** — tap **Allow** (required to scan for videos)
2. **Modify system settings** (brightness) — if prompted, toggle it on in the system settings page that opens

---

## 9. Add a Test Video (Emulator Only)

The emulator has no videos by default. Push one from your PC:

```powershell
adb push "C:\Users\<YourName>\Downloads\some-video.mp4" /storage/emulated/0/Download/test.mp4
```

Then tap **Scan Again** in the app. The video will appear grouped under the `Download` folder.

---

## 10. Useful Commands

```powershell
# Type-check TypeScript
npm run tsc

# Lint
npm run lint

# Run tests
npm test

# Clear Metro cache (fixes stale bundle issues)
npm start -- --reset-cache

# Clean Gradle build
cd android; ./gradlew clean; cd ..

# View live app logs
adb logcat -s ReactNativeJS

# Uninstall app from device
adb uninstall com.aivideoplayer

# Check React Native environment
npx react-native doctor
```

---

## 11. Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `adb` not recognized | PATH not set | `$env:PATH += ";C:\Users\<You>\AppData\Local\Android\Sdk\platform-tools"` |
| `JAVA_HOME` prints literally | Env var not set | Set `JAVA_HOME` in System Environment Variables and reopen terminal |
| `SDK location not found` | `local.properties` missing | Create `android/local.properties` with `sdk.dir=C\:\\Users\\<You>\\AppData\\Local\\Android\\Sdk` |
| `NDK not configured` | NDK not installed | Install NDK `25.1.8937393` via Android Studio SDK Manager → SDK Tools |
| `Could not connect to development server` | Firewall or port issue | Add firewall rule (Step 5), then run `adb reverse tcp:8081 tcp:8081` |
| `RNGestureHandlerModule not found` | Wrong gesture handler version | Run `npm install react-native-gesture-handler@2.14.1` |
| `androidx.core requires AGP 8.6.0` | Gesture handler too new | Pin to `2.14.1`: `npm install react-native-gesture-handler@2.14.1` |
| Metro bundle error (500) | Stale cache after version change | Stop Metro, run `npm start -- --reset-cache` |
| App installed but blank screen | Metro not running | Ensure Terminal 1 (Metro) is running before launching |
| `adb: no devices found` | Emulator not ready | Wait for emulator to fully boot, then retry `adb devices` |
| Gradle build fails | Stale build cache | `cd android && ./gradlew clean && cd ..` then retry |
| `No Videos Found` on emulator | No video files in storage | Push a video with `adb push` (see Step 9) |
