import React from 'react';
import { View, Text } from 'react-native';
import { Card, CardContent } from './ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: any;
}

export const StatCard = ({ title, value, subtitle, icon: Icon }: StatCardProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm font-medium text-zinc-400 mb-1">{title}</Text>
          <Text className="text-3xl font-bold text-white">{value}</Text>
          {subtitle && <Text className="text-xs text-zinc-500 mt-2">{subtitle}</Text>}
        </View>
        {Icon && (
          <View className="bg-blue-600/10 p-4 rounded-2xl ml-4">
            <Icon size={28} color="#3b82f6" />
          </View>
        )}
      </CardContent>
    </Card>
  );
};
