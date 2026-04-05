import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface BadgeProps extends ViewProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

export const Badge = ({ children, variant = 'default', className = '', ...props }: BadgeProps) => {
  let baseClass = 'px-2.5 py-0.5 rounded-full items-center justify-center border';
  let textClass = 'text-xs font-semibold tracking-tight';

  if (variant === 'default') {
    baseClass += ' bg-primary border-transparent';
    textClass += ' text-primary-foreground';
  } else if (variant === 'secondary') {
    baseClass += ' bg-secondary border-transparent';
    textClass += ' text-secondary-foreground';
  } else if (variant === 'destructive') {
    baseClass += ' bg-destructive border-transparent';
    textClass += ' text-destructive-foreground';
  } else if (variant === 'outline') {
    baseClass += ' border-border bg-transparent';
    textClass += ' text-foreground';
  } else if (variant === 'success') {
    baseClass += ' bg-success border-transparent';
    textClass += ' text-success-foreground';
  }

  return (
    <View className={`${baseClass} ${className}`} {...props}>
      {typeof children === 'string' ? <Text className={textClass}>{children}</Text> : children}
    </View>
  );
};
