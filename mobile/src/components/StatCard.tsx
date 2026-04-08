import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: any;
  accentColor?: string;
  gradientColors?: [string, string];
}

export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  accentColor = 'hsl(173, 50%, 50%)',
  gradientColors,
}: StatCardProps) => {
  const defaultGradient: [string, string] = ['hsla(173, 50%, 50%, 0.12)', 'hsla(173, 50%, 50%, 0.04)'];
  const gradient = gradientColors || defaultGradient;

  return (
    <View
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
      className="mb-3 rounded-2xl border border-border/60 bg-card overflow-hidden"
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{title}</Text>
            <Text className="text-3xl font-extrabold text-foreground tracking-tight">{value}</Text>
            {subtitle && <Text className="text-xs text-muted-foreground mt-1.5 font-medium">{subtitle}</Text>}
          </View>
          {Icon && (
            <View 
              style={{ backgroundColor: accentColor + '1A' }}
              className="p-3.5 rounded-xl"
            >
              <Icon size={24} color={accentColor} />
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};
