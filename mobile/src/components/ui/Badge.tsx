import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface BadgeProps extends ViewProps {
  variant?: 'default' | 'secondary' | 'outline' | 'success';
  children: React.ReactNode;
}

export const Badge = ({ children, variant = 'default', className = '', ...props }: BadgeProps) => {
  let baseClass = 'px-3 py-1 rounded-full items-center justify-center';
  let textClass = 'text-xs font-semibold';

  if (variant === 'default') {
    baseClass += ' bg-blue-600';
    textClass += ' text-white';
  } else if (variant === 'secondary') {
    baseClass += ' bg-zinc-800';
    textClass += ' text-zinc-300';
  } else if (variant === 'outline') {
    baseClass += ' border border-zinc-700 bg-transparent';
    textClass += ' text-zinc-400';
  } else if (variant === 'success') {
    baseClass += ' bg-emerald-500/20';
    textClass += ' text-emerald-400';
  }

  return (
    <View className={`${baseClass} ${className}`} {...props}>
      <Text className={textClass}>{children}</Text>
    </View>
  );
};
