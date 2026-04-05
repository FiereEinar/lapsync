import React from 'react';
import { View, Text, ViewProps, TextProps } from 'react-native';

export const Card = ({ children, className = '', ...props }: ViewProps) => (
  <View className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden ${className}`} {...props}>
    {children}
  </View>
);

export const CardHeader = ({ children, className = '', ...props }: ViewProps) => (
  <View className={`px-5 py-4 border-b border-zinc-800 flex-row items-center justify-between ${className}`} {...props}>
    {children}
  </View>
);

export const CardTitle = ({ children, className = '', ...props }: TextProps) => (
  <Text className={`text-lg font-semibold text-white ${className}`} {...props}>
    {children}
  </Text>
);

export const CardContent = ({ children, className = '', ...props }: ViewProps) => (
  <View className={`p-5 ${className}`} {...props}>
    {children}
  </View>
);
