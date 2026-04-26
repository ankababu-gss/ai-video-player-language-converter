export interface VideoFile {
  name: string;
  path: string;
  size: number;
  mtime: Date;
}

export interface VideoFolder {
  name: string;
  path: string;
  videos: VideoFile[];
}

export interface AudioTrack {
  index: number;
  title: string;
  language: string;
  bitrate: number;
  type: string;
  selected: boolean;
}

export interface PlayerState {
  paused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  brightness: number;
  showControls: boolean;
  audioTracks: AudioTrack[];
  selectedAudioTrackIndex: number;
  playbackSpeed: number;
}
