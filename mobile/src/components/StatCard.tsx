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
      <CardContent className="flex-row items-center justify-between mt-6">
        <View className="flex-1">
          <Text className="text-sm font-medium text-muted-foreground mb-1">{title}</Text>
          <Text className="text-3xl font-bold text-foreground">{value}</Text>
          {subtitle && <Text className="text-xs text-muted-foreground mt-2">{subtitle}</Text>}
        </View>
        {Icon && (
          <View className="bg-primary/10 p-4 rounded-2xl ml-4">
            <Icon size={28} color="hsl(var(--primary))" />
          </View>
        )}
      </CardContent>
    </Card>
  );
};
