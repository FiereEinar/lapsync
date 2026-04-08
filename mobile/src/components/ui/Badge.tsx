import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface BadgeProps extends ViewProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

export const Badge = ({ children, variant = 'default', className = '', ...props }: BadgeProps) => {
  let baseClass = 'px-2.5 py-1 rounded-lg items-center justify-center';
  let textClass = 'text-[10px] font-bold tracking-wider uppercase';

  if (variant === 'default') {
    baseClass += ' bg-primary/15';
    textClass += ' text-primary';
  } else if (variant === 'secondary') {
    baseClass += ' bg-secondary';
    textClass += ' text-secondary-foreground';
  } else if (variant === 'destructive') {
    baseClass += ' bg-destructive/15';
    textClass += ' text-destructive';
  } else if (variant === 'outline') {
    baseClass += ' border border-border bg-transparent';
    textClass += ' text-foreground';
  } else if (variant === 'success') {
    baseClass += ' bg-success/15';
    textClass += ' text-success';
  }

  return (
    <View className={`${baseClass} ${className}`} {...props}>
      {typeof children === 'string' ? <Text className={textClass}>{children}</Text> : children}
    </View>
  );
};
