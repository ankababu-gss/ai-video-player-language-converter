import React from 'react';
import {
  TouchableHighlight,
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import {VideoFolder} from '../types';

interface Props {
  folder: VideoFolder;
  onPress: () => void;
  hasTVPreferredFocus?: boolean;
}

const AVATAR_COLORS = [
  '#1A6B5A',
  '#1A4B6B',
  '#5A1A6B',
  '#6B3A1A',
  '#1A5A6B',
  '#6B1A3A',
  '#3A6B1A',
  '#1A1A6B',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const isTV = Platform.isTV;
const SCALE = isTV ? 1.4 : 1;

export default function FolderListItem({folder, onPress, hasTVPreferredFocus}: Props) {
  const letter = folder.name.charAt(0).toUpperCase() || '#';
  const bg = avatarColor(folder.name);
  const count = folder.videos.length;
  const tvProps = isTV && hasTVPreferredFocus ? {hasTVPreferredFocus: true} : {};

  return (
    <TouchableHighlight
      onPress={onPress}
      {...(tvProps as any)}
      underlayColor="#1A1A2E"
      style={styles.item}>
      <View style={styles.row}>
        <View style={[styles.avatar, {backgroundColor: bg}]}>
          <Text style={styles.avatarLetter}>{letter}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {folder.name}
          </Text>
          <Text style={styles.sub}>
            {count} {count === 1 ? 'video' : 'videos'}
          </Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{count}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  item: {
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  avatar: {
    width: 48 * SCALE,
    height: 48 * SCALE,
    borderRadius: 12 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarLetter: {
    fontSize: 20 * SCALE,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  info: {flex: 1},
  name: {
    fontSize: 15 * SCALE,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  sub: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
  },
  countPill: {
    backgroundColor: '#0D2B24',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginRight: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12 * SCALE,
    fontWeight: '700',
    color: '#00BFA5',
  },
  chevron: {
    color: '#374151',
    fontSize: 22,
  },
});
