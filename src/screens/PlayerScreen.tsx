import React, {useRef, useEffect, useCallback, useState} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableWithoutFeedback,
} from 'react-native';
import Video, {VideoRef, SelectedTrackType} from 'react-native-video';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import {RootStackParamList} from '../navigation/AppNavigator';
import VideoControls from '../components/VideoControls';
import {useVideoPlayer} from '../hooks/useVideoPlayer';
import {useTVRemote} from '../hooks/useTVRemote';
import {AudioTrack} from '../types';

type RouteProps = RouteProp<RootStackParamList, 'Player'>;

export default function PlayerScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const {videos, currentIndex: initialIndex} = route.params;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentVideo = videos[currentIndex];
  const videoRef = useRef<VideoRef>(null);

  const {
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
  } = useVideoPlayer();

  useEffect(() => {
    Orientation.lockToLandscape();
    return () => Orientation.unlockAllOrientations();
  }, []);

  useEffect(() => {
    resetForNewVideo();
    videoRef.current?.seek(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleRewind = useCallback(() => seek(-10), [seek]);
  const handleFastForward = useCallback(() => seek(10), [seek]);
  useTVRemote(togglePause, handleRewind, handleFastForward);

  const handleSeekTo = useCallback(
    (time: number) => {
      videoRef.current?.seek(time);
      setCurrentTime(time);
    },
    [setCurrentTime],
  );

  const goToPrev = useCallback(() => {
    setCurrentIndex(i => Math.max(0, i - 1));
  }, []);

  const goToNext = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      navigation.goBack();
    }
  }, [currentIndex, videos.length, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <TouchableWithoutFeedback onPress={toggleControls}>
        <View style={StyleSheet.absoluteFill}>
          <Video
            ref={videoRef}
            source={{uri: `file://${currentVideo.path}`}}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
            paused={state.paused}
            volume={state.volume}
            rate={state.playbackSpeed}
            selectedAudioTrack={
              state.audioTracks.length > 1
                ? {type: SelectedTrackType.INDEX, value: state.selectedAudioTrackIndex}
                : undefined
            }
            onLoad={data => {
              setDuration(data.duration);
              if (data.audioTracks?.length) {
                setAudioTracks(data.audioTracks as AudioTrack[]);
              }
            }}
            onProgress={data => setCurrentTime(data.currentTime)}
            onEnd={goToNext}
            ignoreSilentSwitch="ignore"
          />
        </View>
      </TouchableWithoutFeedback>

      {state.showControls && (
        <VideoControls
          state={state}
          fileName={currentVideo.name}
          onBack={() => navigation.goBack()}
          onTogglePause={togglePause}
          onSeek={handleSeekTo}
          onSeekDelta={seek}
          onVolumeChange={setVolume}
          onBrightnessChange={setBrightness}
          onSelectAudioTrack={selectAudioTrack}
          onCycleSpeed={cycleSpeed}
          onPrev={currentIndex > 0 ? goToPrev : undefined}
          onNext={currentIndex < videos.length - 1 ? goToNext : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
});
