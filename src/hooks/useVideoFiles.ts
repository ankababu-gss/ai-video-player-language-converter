import {useState, useEffect} from 'react';
import RNFS from 'react-native-fs';
import {PermissionsAndroid, Platform} from 'react-native';
import {VideoFile} from '../types';
import {isVideoFile} from '../utils/fileUtils';

export function useVideoFiles() {
  const [files, setFiles] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function requestPermission(): Promise<boolean> {
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

  async function loadFiles() {
    try {
      setLoading(true);
      setError(null);
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError('Storage permission denied. Please grant it in Settings.');
        return;
      }
      const items = await RNFS.readDir(RNFS.DownloadDirectoryPath);
      const videoFiles: VideoFile[] = items
        .filter(item => item.isFile() && isVideoFile(item.name))
        .map(item => ({
          name: item.name,
          path: item.path,
          size: item.size,
          mtime: item.mtime ?? new Date(),
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      setFiles(videoFiles);
    } catch {
      setError('Failed to scan Downloads folder.');
    } finally {
      setLoading(false);
    }
  }

  return {files, loading, error, reload: loadFiles};
}
