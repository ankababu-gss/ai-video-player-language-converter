import React from 'react';
import { TouchableHighlight, View, Text, StyleSheet, Platform } from 'react-native';
import { VideoFile } from '../types';
import { formatFileSize, getFileNameWithoutExtension } from '../utils/fileUtils';

interface Props {
  file: VideoFile;
  onPress: () => void;
  hasTVPreferredFocus?: boolean;
}

export default function FileListItem({ file, onPress, hasTVPreferredFocus }: Props) {
  const isTV = Platform.isTV;
  const ext = file.name.split('.').pop()?.toUpperCase() ?? '';
  const tvProps = isTV && hasTVPreferredFocus ? { hasTVPreferredFocus: true } : {};

  return (
    <TouchableHighlight
      onPress={onPress}
      {...(tvProps as any)}
      underlayColor="#2a2a2a"
      style={styles.item}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🎬</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, isTV && styles.nameTV]} numberOfLines={2}>
            {getFileNameWithoutExtension(file.name)}
          </Text>
          <Text style={[styles.meta, isTV && styles.metaTV]}>
            {formatFileSize(file.size)}
            {ext ? ` · ${ext}` : ''}
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  item: {
    marginHorizontal: 12,
    marginVertical: 3,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 26 },
  info: { flex: 1 },
  name: { color: '#fff', fontSize: 15, fontWeight: '500' },
  nameTV: { fontSize: 20 },
  meta: { color: '#888', fontSize: 12, marginTop: 3 },
  metaTV: { fontSize: 16 },
  arrow: { color: '#555', fontSize: 22, paddingLeft: 8 },
});
