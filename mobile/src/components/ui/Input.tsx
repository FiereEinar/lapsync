import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

export const Input = React.forwardRef<any, TextInputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={`flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:border-ring ${className}`}
        placeholderTextColor="hsl(0, 0%, 70%)"
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
