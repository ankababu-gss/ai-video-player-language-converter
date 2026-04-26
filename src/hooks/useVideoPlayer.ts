import {useState, useRef, useEffect, useCallback} from 'react';
import SystemSetting from 'react-native-system-setting';
import {AudioTrack, PlayerState} from '../types';

const CONTROLS_HIDE_DELAY = 3000;
const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

const DEFAULT_STATE: PlayerState = {
  paused: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  brightness: 0.5,
  showControls: true,
  audioTracks: [],
  selectedAudioTrackIndex: 0,
  playbackSpeed: 1.0,
};

export function useVideoPlayer() {
  const [state, setState] = useState<PlayerState>(DEFAULT_STATE);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    SystemSetting.getBrightness().then(b => {
      setState(prev => ({...prev, brightness: b}));
    });
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(() => {
      setState(prev => ({...prev, showControls: false}));
    }, CONTROLS_HIDE_DELAY);
  }, []);

  const toggleControls = useCallback(() => {
    setState(prev => {
      if (!prev.showControls) {
        scheduleHide();
      }
      return {...prev, showControls: !prev.showControls};
    });
  }, [scheduleHide]);

  const togglePause = useCallback(() => {
    setState(prev => ({...prev, paused: !prev.paused}));
    scheduleHide();
  }, [scheduleHide]);

  const seek = useCallback(
    (deltaSeconds: number) => {
      setState(prev => ({
        ...prev,
        currentTime: Math.max(
          0,
          Math.min(prev.currentTime + deltaSeconds, prev.duration),
        ),
      }));
      scheduleHide();
    },
    [scheduleHide],
  );

  const setCurrentTime = useCallback((time: number) => {
    setState(prev => ({...prev, currentTime: time}));
  }, []);

  const setDuration = useCallback((duration: number) => {
    setState(prev => ({...prev, duration}));
  }, []);

  const setVolume = useCallback(
    (volume: number) => {
      setState(prev => ({...prev, volume}));
      scheduleHide();
    },
    [scheduleHide],
  );

  const setBrightness = useCallback(
    (brightness: number) => {
      SystemSetting.setBrightness(brightness).then(success => {
        if (!success) {
          SystemSetting.grantWriteSettingPremission();
        }
      });
      setState(prev => ({...prev, brightness}));
      scheduleHide();
    },
    [scheduleHide],
  );

  const setAudioTracks = useCallback((tracks: AudioTrack[]) => {
    setState(prev => ({...prev, audioTracks: tracks}));
  }, []);

  const selectAudioTrack = useCallback(
    (index: number) => {
      setState(prev => ({...prev, selectedAudioTrackIndex: index}));
      scheduleHide();
    },
    [scheduleHide],
  );

  const cycleSpeed = useCallback(() => {
    setState(prev => {
      const idx = SPEED_OPTIONS.indexOf(prev.playbackSpeed);
      const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
      return {...prev, playbackSpeed: next};
    });
    scheduleHide();
  }, [scheduleHide]);

  const resetForNewVideo = useCallback(() => {
    setState(prev => ({
      ...DEFAULT_STATE,
      volume: prev.volume,
      brightness: prev.brightness,
      playbackSpeed: prev.playbackSpeed,
      showControls: true,
    }));
    scheduleHide();
  }, [scheduleHide]);

  return {
    state,
    toggleControls,
    togglePause,
    seek,
    setCurrentTime,
    setDuration,
    setVolume,
    setBrightness,
    setAudioTracks,
    selectAudioTrack,
    cycleSpeed,
    resetForNewVideo,
  };
}
