import React from 'react';
import { View, Text } from 'react-native';

export const PlaceholderScreen = ({ name }: { name: string }) => (
  <View className="flex-1 bg-zinc-950 items-center justify-center">
    <Text className="text-zinc-400 text-lg font-bold">{name}</Text>
    <Text className="text-zinc-600 text-sm mt-2">Screen Under Construction</Text>
  </View>
);
