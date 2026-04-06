import React from 'react';
import { View, Text, ViewProps, TextProps } from 'react-native';

export const Card = ({ children, className = '', ...props }: ViewProps) => (
  <View 
    style={{
        shadowColor: 'hsl(0, 0%, 95%)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2, // Android shadow
    }}
    className={`rounded-xl border border-border bg-card shadow-sm ${className}`} 
    {...props}
  >
    {children}
  </View>
);

export const CardHeader = ({ children, className = '', ...props }: ViewProps) => (
  <View className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </View>
);

export const CardTitle = ({ children, className = '', ...props }: TextProps) => (
  <Text className={`text-2xl font-semibold leading-none tracking-tight text-card-foreground ${className}`} {...props}>
    {children}
  </Text>
);

export const CardDescription = ({ children, className = '', ...props }: TextProps) => (
  <Text className={`text-sm text-muted-foreground mt-2 ${className}`} {...props}>
    {children}
  </Text>
);

export const CardContent = ({ children, className = '', ...props }: ViewProps) => (
  <View className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </View>
);

export const CardFooter = ({ children, className = '', ...props }: ViewProps) => (
  <View className={`flex flex-row items-center p-6 pt-0 ${className}`} {...props}>
    {children}
  </View>
);
