import React from 'react';
import { View, Text, ViewProps, TextProps } from 'react-native';

export const Card = ({ children, className = '', ...props }: ViewProps) => (
  <View 
    className={`rounded-2xl border border-border/60 bg-card ${className}`} 
    {...props}
  >
    {children}
  </View>
);

export const CardHeader = ({ children, className = '', ...props }: ViewProps) => (
  <View className={`flex flex-col space-y-1.5 p-5 ${className}`} {...props}>
    {children}
  </View>
);

export const CardTitle = ({ children, className = '', ...props }: TextProps) => (
  <Text className={`text-lg font-bold leading-none tracking-tight text-card-foreground ${className}`} {...props}>
    {children}
  </Text>
);

export const CardDescription = ({ children, className = '', ...props }: TextProps) => (
  <Text className={`text-sm text-muted-foreground mt-1.5 ${className}`} {...props}>
    {children}
  </Text>
);

export const CardContent = ({ children, className = '', ...props }: ViewProps) => (
  <View className={`px-5 pb-5 pt-0 ${className}`} {...props}>
    {children}
  </View>
);

export const CardFooter = ({ children, className = '', ...props }: ViewProps) => (
  <View className={`flex flex-row items-center px-5 pb-5 pt-0 ${className}`} {...props}>
    {children}
  </View>
);
