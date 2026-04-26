import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { PlayerState } from '../types';
import { formatDuration, getFileNameWithoutExtension } from '../utils/fileUtils';
import AudioTrackPicker from './AudioTrackPicker';

interface Props {
  state: PlayerState;
  fileName: string;
  onBack: () => void;
  onTogglePause: () => void;
  onSeek: (time: number) => void;
  onSeekDelta: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onBrightnessChange: (brightness: number) => void;
  onSelectAudioTrack: (index: number) => void;
  onCycleSpeed: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const isTV = Platform.isTV;
const SCALE = isTV ? 1.4 : 1;
const PLAY_BTN = 56 * SCALE;

function speedLabel(speed: number): string {
  return speed === 1.0 ? '1x' : `${speed}x`;
}

export default function VideoControls({
  state,
  fileName,
  onBack,
  onTogglePause,
  onSeek,
  onSeekDelta,
  onVolumeChange,
  onBrightnessChange,
  onSelectAudioTrack,
  onCycleSpeed,
  onPrev,
  onNext,
}: Props) {
  const [showAudioPicker, setShowAudioPicker] = useState(false);
  const remaining = state.duration - state.currentTime;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hasTVPreferredFocus={isTV}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titleText} numberOfLines={1}>
          {getFileNameWithoutExtension(fileName)}
        </Text>
        <TouchableOpacity style={styles.speedPill} onPress={onCycleSpeed}>
          <Text style={styles.speedText}>{speedLabel(state.playbackSpeed)}</Text>
        </TouchableOpacity>
        {state.audioTracks.length > 1 && (
          <TouchableOpacity style={styles.audioBtn} onPress={() => setShowAudioPicker(true)}>
            <Text style={styles.audioBtnText}>Audio</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Spacer — tap area handled by parent TouchableWithoutFeedback */}
      <View style={styles.spacer} />

      {/* Bottom controls area */}
      <View style={styles.bottomArea}>
        {/* Volume slider */}
        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>VOL</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={state.volume}
            onValueChange={onVolumeChange}
            minimumTrackTintColor="#00BFA5"
            maximumTrackTintColor="#374151"
            thumbTintColor="#00BFA5"
          />
        </View>

        {/* Brightness slider (phones only) */}
        {!isTV && (
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>BRT</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={state.brightness}
              onValueChange={onBrightnessChange}
              minimumTrackTintColor="#F59E0B"
              maximumTrackTintColor="#374151"
              thumbTintColor="#F59E0B"
            />
          </View>
        )}

        {/* Progress bar */}
        <View style={styles.progressRow}>
          <Text style={styles.timeText}>{formatDuration(state.currentTime)}</Text>
          <Slider
            style={styles.progressSlider}
            minimumValue={0}
            maximumValue={state.duration > 0 ? state.duration : 1}
            value={state.currentTime}
            onSlidingComplete={onSeek}
            minimumTrackTintColor="#00BFA5"
            maximumTrackTintColor="#374151"
            thumbTintColor="#FFFFFF"
          />
          <Text style={[styles.timeText, styles.timeRight]}>
            -{formatDuration(remaining > 0 ? remaining : 0)}
          </Text>
        </View>

        {/* Playback control row */}
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.navBtn, !onPrev && styles.navBtnDisabled]}
            onPress={onPrev}
            disabled={!onPrev}>
            <Text style={[styles.navBtnText, !onPrev && styles.navBtnTextDisabled]}>|◀</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={() => onSeekDelta(-10)}>
            <Text style={styles.skipText}>10</Text>
            <Text style={styles.skipArrow}>◀</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.playBtn} onPress={onTogglePause}>
            <Text style={styles.playBtnText}>{state.paused ? '▶' : '⏸'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={() => onSeekDelta(10)}>
            <Text style={styles.skipArrow}>▶</Text>
            <Text style={styles.skipText}>10</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, !onNext && styles.navBtnDisabled]}
            onPress={onNext}
            disabled={!onNext}>
            <Text style={[styles.navBtnText, !onNext && styles.navBtnTextDisabled]}>▶|</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showAudioPicker && (
        <AudioTrackPicker
          tracks={state.audioTracks}
          selectedIndex={state.selectedAudioTrackIndex}
          onSelect={(index) => {
            onSelectAudioTrack(index);
            setShowAudioPicker(false);
          }}
          onClose={() => setShowAudioPicker(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    gap: 8,
  },
  backBtn: {
    width: 36 * SCALE,
    height: 36 * SCALE,
    borderRadius: 18 * SCALE,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18 * SCALE, color: '#FFFFFF' },
  titleText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14 * SCALE,
    fontWeight: '600',
  },
  speedPill: {
    backgroundColor: 'rgba(0,191,165,0.2)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00BFA5',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  speedText: {
    color: '#00BFA5',
    fontSize: 13 * SCALE,
    fontWeight: '700',
  },
  audioBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  audioBtnText: {
    color: '#FFFFFF',
    fontSize: 12 * SCALE,
    fontWeight: '500',
  },
  spacer: { flex: 1 },
  bottomArea: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 4,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
  },
  sliderLabel: {
    color: '#9CA3AF',
    fontSize: 10 * SCALE,
    fontWeight: '600',
    width: 30 * SCALE,
    letterSpacing: 0.5,
  },
  slider: { flex: 1, height: 32 },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    color: '#D1D5DB',
    fontSize: 12 * SCALE,
    minWidth: 46 * SCALE,
    fontVariant: ['tabular-nums'],
  },
  timeRight: { textAlign: 'right' },
  progressSlider: { flex: 1, height: 40 },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20 * SCALE,
    paddingVertical: 8,
  },
  navBtn: {
    width: 40 * SCALE,
    height: 40 * SCALE,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  navBtnText: {
    fontSize: 14 * SCALE,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  navBtnTextDisabled: {
    color: '#4B5563',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 3,
  },
  skipArrow: { fontSize: 16 * SCALE, color: '#D1D5DB' },
  skipText: { fontSize: 11 * SCALE, color: '#9CA3AF', fontWeight: '600' },
  playBtn: {
    width: PLAY_BTN,
    height: PLAY_BTN,
    borderRadius: PLAY_BTN / 2,
    backgroundColor: '#00BFA5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00BFA5',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playBtnText: {
    fontSize: 22 * SCALE,
    color: '#FFFFFF',
    marginLeft: 2,
  },
});
