import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import FolderScreen from '../screens/FolderScreen';
import PlayerScreen from '../screens/PlayerScreen';
import { VideoFile, VideoFolder } from '../types';

export type RootStackParamList = {
  Home: undefined;
  Folder: { folder: VideoFolder };
  Player: { videos: VideoFile[]; currentIndex: number };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Folder" component={FolderScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
    </Stack.Navigator>
  );
}
