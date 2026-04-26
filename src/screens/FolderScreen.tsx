import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RootStackParamList} from '../navigation/AppNavigator';
import FileListItem from '../components/FileListItem';

type Route = RouteProp<RootStackParamList, 'Folder'>;
type Nav = StackNavigationProp<RootStackParamList, 'Folder'>;

const isTV = Platform.isTV;

export default function FolderScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {top} = useSafeAreaInsets();
  const {folder} = route.params;

  function openVideo(index: number) {
    navigation.navigate('Player', {
      videos: folder.videos,
      currentIndex: index,
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />

      <View style={[styles.header, {paddingTop: isTV ? 24 : top + 12}]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hasTVPreferredFocus={isTV}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.folderName} numberOfLines={1}>
            {folder.name}
          </Text>
          <Text style={styles.folderSub}>
            {folder.videos.length} {folder.videos.length === 1 ? 'video' : 'videos'}
          </Text>
        </View>
      </View>

      <FlatList
        data={folder.videos}
        keyExtractor={item => item.path}
        renderItem={({item, index}) => (
          <FileListItem
            file={item}
            onPress={() => openVideo(index)}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1E1E2E',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backArrow: {fontSize: 18, color: '#FFFFFF'},
  headerText: {flex: 1},
  folderName: {
    color: '#FFFFFF',
    fontSize: isTV ? 26 : 18,
    fontWeight: '700',
  },
  folderSub: {
    color: '#6B7280',
    fontSize: isTV ? 16 : 13,
    marginTop: 2,
  },
  list: {paddingVertical: 8, paddingBottom: 32},
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#1A1A2E',
    marginLeft: 72,
  },
});
