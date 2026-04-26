# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

React Native video player for Android (phone + TV). Scans the device's Downloads folder for video files and plays them with full playback controls. Package name: `com.aivideoplayer`.

## Commands

```bash
# Start Metro bundler
npm start

# Build and run on connected Android device / emulator
npm run android

# TypeScript type-check (no emit)
npm run tsc

# Lint
npm run lint

# Tests
npm test
```

Run a single Jest test file:
```bash
npx jest src/hooks/useVideoFiles.test.ts
```

## Architecture

Navigation stack: **Home → Folder → Player** (three screens, no header, no animation).

```
index.js                   Entry point — registers "AIVideoPlayer" component
src/
  App.tsx                  Root: SafeAreaProvider + NavigationContainer
  navigation/
    AppNavigator.tsx       Stack navigator: Home → Folder → Player
  screens/
    HomeScreen.tsx         Uses useVideoFolders; shows FolderListItem list
    FolderScreen.tsx       Receives VideoFolder via route params; shows FileListItem list
    PlayerScreen.tsx       Full-screen player, locks to landscape
  components/
    VideoControls.tsx      Overlay: top bar, play/pause/seek, progress bar,
                           volume slider, brightness slider, audio track button
    FileListItem.tsx       Single row in the video file list
    FolderListItem.tsx     Single row in the folder list (color avatar, video count pill)
    AudioTrackPicker.tsx   Bottom-sheet Modal for audio track selection
  hooks/
    useVideoFolders.ts     Scans /storage/emulated/0 recursively (depth ≤ 2, skips Android/
                           data/.thumbnails/.trash/obb), groups results into VideoFolder[]
    useVideoFiles.ts       Legacy hook — scans Downloads only (flat); no longer used by screens
    useVideoPlayer.ts      All playback state; auto-hides controls after 3 s
    useTVRemote.ts         TVEventHandler wrapper (only active on Platform.isTV)
  utils/
    fileUtils.ts           isVideoFile(), formatFileSize(), formatDuration(), getFileNameWithoutExtension()
  types/
    index.ts               VideoFile, VideoFolder, AudioTrack, PlayerState
android/
  app/src/main/
    AndroidManifest.xml    Declares both LAUNCHER and LEANBACK_LAUNCHER intent-filters
    java/com/aivideoplayer/ MainActivity.kt, MainApplication.kt
```

## Key Dependencies

| Package | Purpose |
|---|---|
| `react-native-video` ^6 | Video playback; `selectedAudioTrack` prop for track switching |
| `react-native-fs` | `RNFS.DownloadDirectoryPath` to list videos |
| `react-native-system-setting` | `getBrightness` / `setBrightness` on Android |
| `@react-native-community/slider` | Seek bar, volume slider, brightness slider |
| `react-native-orientation-locker` | Lock to landscape on PlayerScreen |
| `@react-navigation/stack` | Screen navigation |

## Android TV Notes

- Both `LAUNCHER` and `LEANBACK_LAUNCHER` intent-filters are in `AndroidManifest.xml`
- `Platform.isTV` gates the brightness slider (TVs don't expose brightness) and `useTVRemote`
- `hasTVPreferredFocus` is set on the first `FileListItem` and the Back button in `VideoControls`
- TV remote `playPause`, `rewind`, `fastForward` events are handled in `useTVRemote`

## Storage Permission

`useVideoFolders` requests `READ_MEDIA_VIDEO` on Android 13+ (API 33+) and falls back to `READ_EXTERNAL_STORAGE` on older versions.

## Brightness Permission

On Android 6+ (API 23+), `WRITE_SETTINGS` is a special permission. `react-native-system-setting` handles this: if `setBrightness()` returns `false`, it calls `grantWriteSettingPerm()` to open the system settings page for the user to grant it.
