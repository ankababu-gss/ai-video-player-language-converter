import React, {useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useVideoFolders} from '../hooks/useVideoFolders';
import FolderListItem from '../components/FolderListItem';
import {RootStackParamList} from '../navigation/AppNavigator';
import {VideoFolder} from '../types';

type NavProp = StackNavigationProp<RootStackParamList, 'Home'>;

const isTV = Platform.isTV;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const {top} = useSafeAreaInsets();
  const {folders, loading, error, load} = useVideoFolders();

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openFolder(folder: VideoFolder) {
    navigation.navigate('Folder', {folder});
  }

  const totalVideos = folders.reduce((sum, f) => sum + f.videos.length, 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
        <ActivityIndicator size="large" color="#00BFA5" />
        <Text style={styles.message}>Scanning storage...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
        <Text style={styles.errorTitle}>Permission Required</Text>
        <Text style={styles.message}>{error}</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={load}>
          <Text style={styles.actionBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (folders.length === 0) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
        <Text style={styles.emptyTitle}>No Videos Found</Text>
        <Text style={styles.message}>
          Add video files to your device storage to get started.
        </Text>
        <TouchableOpacity style={styles.actionBtn} onPress={load}>
          <Text style={styles.actionBtnText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />

      <View style={[styles.header, {paddingTop: isTV ? 24 : top + 12}]}>
        <View>
          <Text style={styles.appTitle}>Video Library</Text>
          <Text style={styles.headerSub}>
            {folders.length} folders · {totalVideos} videos
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={load}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={folders}
        keyExtractor={item => item.path}
        renderItem={({item, index}) => (
          <FolderListItem
            folder={item}
            onPress={() => openFolder(item)}
            hasTVPreferredFocus={index === 0}
          />
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0D0D1A'},
  center: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1E1E2E',
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: isTV ? 30 : 22,
    fontWeight: '700',
  },
  headerSub: {
    color: '#6B7280',
    fontSize: isTV ? 16 : 13,
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {fontSize: 20, color: '#00BFA5'},
  list: {paddingVertical: 8, paddingBottom: 32},
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#1A1A2E',
    marginLeft: 76,
  },
  emptyTitle: {color: '#FFFFFF', fontSize: 18, fontWeight: '600'},
  errorTitle: {color: '#F87171', fontSize: 18, fontWeight: '600'},
  message: {
    color: '#6B7280',
    fontSize: isTV ? 16 : 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: '#00BFA5',
    borderRadius: 8,
  },
  actionBtnText: {color: '#FFFFFF', fontSize: 15, fontWeight: '600'},
});
