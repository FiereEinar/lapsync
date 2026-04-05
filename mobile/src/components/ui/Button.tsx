import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, TextProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  textProps?: TextProps;
}

export const Button = React.forwardRef<any, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', children, textProps, ...props }, ref) => {
    let baseClass = 'flex-row items-center justify-center rounded-md ';
    let textClass = 'text-sm font-medium ';

    if (variant === 'default') {
      baseClass += 'bg-primary shadow-sm';
      textClass += 'text-primary-foreground';
    } else if (variant === 'destructive') {
      baseClass += 'bg-destructive shadow-sm';
      textClass += 'text-destructive-foreground';
    } else if (variant === 'outline') {
      baseClass += 'border border-input bg-background shadow-sm';
      textClass += 'text-foreground';
    } else if (variant === 'secondary') {
      baseClass += 'bg-secondary';
      textClass += 'text-secondary-foreground';
    } else if (variant === 'ghost') {
      baseClass += 'bg-transparent';
      textClass += 'text-foreground';
    } else if (variant === 'link') {
      baseClass += 'bg-transparent';
      textClass += 'text-primary underline';
    }

    if (size === 'default') {
      baseClass += ' h-10 px-4 py-2';
    } else if (size === 'sm') {
      baseClass += ' h-9 px-3 rounded-md';
    } else if (size === 'lg') {
      baseClass += ' h-11 px-8 rounded-md';
    } else if (size === 'icon') {
      baseClass += ' h-10 w-10';
    }

    return (
      <TouchableOpacity ref={ref} className={`${baseClass} ${className}`} activeOpacity={0.8} {...props}>
        {typeof children === 'string' ? (
          <Text className={textClass} {...textProps}>
            {children}
          </Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);
Button.displayName = 'Button';
