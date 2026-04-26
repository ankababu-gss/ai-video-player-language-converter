import { useState, useCallback } from 'react';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform } from 'react-native';
import { VideoFile, VideoFolder } from '../types';
import { isVideoFile } from '../utils/fileUtils';

const STORAGE_ROOT = '/storage/emulated/0';
const SKIP_DIRS = new Set(['Android', 'data', '.thumbnails', '.trash', 'obb']);

async function requestPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  if ((Platform.Version as number) >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

function makeVideoFile(item: RNFS.ReadDirItem): VideoFile {
  return {
    name: item.name,
    path: item.path,
    size: Number(item.size) || 0,
    mtime: item.mtime ?? new Date(),
  };
}

async function scanDir(dirPath: string, depth: number): Promise<VideoFile[]> {
  const videos: VideoFile[] = [];
  try {
    const items = await RNFS.readDir(dirPath);
    for (const item of items) {
      if (item.isFile() && isVideoFile(item.name)) {
        videos.push(makeVideoFile(item));
      } else if (
        item.isDirectory() &&
        depth < 2 &&
        !item.name.startsWith('.') &&
        !SKIP_DIRS.has(item.name)
      ) {
        const sub = await scanDir(item.path, depth + 1);
        videos.push(...sub);
      }
    }
  } catch {
    // directory not accessible — skip silently
  }
  return videos;
}

function groupByFolder(videos: VideoFile[]): VideoFolder[] {
  const map = new Map<string, VideoFolder>();
  for (const video of videos) {
    const sep = video.path.lastIndexOf('/');
    const folderPath = video.path.substring(0, sep);
    const folderName = folderPath.substring(folderPath.lastIndexOf('/') + 1) || 'Storage';
    if (!map.has(folderPath)) {
      map.set(folderPath, { name: folderName, path: folderPath, videos: [] });
    }
    map.get(folderPath)!.videos.push(video);
  }
  return Array.from(map.values())
    .filter((f) => f.videos.length > 0)
    .sort((a, b) => b.videos.length - a.videos.length);
}

export function useVideoFolders() {
  const [folders, setFolders] = useState<VideoFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const granted = await requestPermission();
      if (!granted) {
        setError('Storage permission denied. Please grant it in Settings.');
        return;
      }
      const videos = await scanDir(STORAGE_ROOT, 0);
      setFolders(groupByFolder(videos));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to scan storage.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { folders, loading, error, load };
}
