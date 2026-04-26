import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import {AudioTrack} from '../types';

interface Props {
  tracks: AudioTrack[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export default function AudioTrackPicker({
  tracks,
  selectedIndex,
  onSelect,
  onClose,
}: Props) {
  function trackLabel(track: AudioTrack): string {
    if (track.title) {
      return track.language ? `${track.title} (${track.language})` : track.title;
    }
    if (track.language) {
      return track.language.toUpperCase();
    }
    return `Track ${track.index + 1}`;
  }

  return (
    <Modal
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
      />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.heading}>Audio Track</Text>
        <FlatList
          data={tracks}
          keyExtractor={item => item.index.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.row,
                item.index === selectedIndex && styles.rowSelected,
              ]}
              onPress={() => onSelect(item.index)}>
              <Text style={styles.trackLabel}>{trackLabel(item)}</Text>
              {item.index === selectedIndex && (
                <Text style={styles.check}>✓</Text>
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 36,
    maxHeight: '55%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#555',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  heading: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  rowSelected: {backgroundColor: '#2a2a2a'},
  trackLabel: {color: '#fff', fontSize: 16},
  check: {color: '#e50914', fontSize: 20, fontWeight: 'bold'},
});
