import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Input } from './Input';
import { Calendar, Clock } from 'lucide-react-native';

interface Props {
  mode: 'date' | 'time';
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function DateTimePickerInput({ mode, value, onChange, placeholder, className }: Props) {
  const [show, setShow] = useState(false);

  let displayValue = value || placeholder || '';
  let dateObj = new Date();

  if (value) {
     if (mode === 'time') {
         const [hours, minutes] = value.split(':');
         dateObj.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
     } else {
         const parsed = new Date(value);
         if (!isNaN(parsed.getTime())) dateObj = parsed;
     }
  }

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShow(false); 
    if (event.type === 'dismissed') {
       setShow(false);
       return;
    }
    if (selectedDate) {
      if (mode === 'time') {
        const hh = selectedDate.getHours().toString().padStart(2, '0');
        const mm = selectedDate.getMinutes().toString().padStart(2, '0');
        onChange(`${hh}:${mm}`);
      } else {
        onChange(selectedDate.toISOString().split('T')[0]);
      }
    }
  };

  return (
    <View className={className}>
      <TouchableOpacity 
         onPress={() => setShow(!show)} 
         className="flex-row items-center relative"
      >
        <Input 
          value={displayValue} 
          editable={false} 
          pointerEvents="none" 
          placeholder={placeholder} 
          className="w-full pl-10 h-12"
        />
        <View className="absolute left-3 top-3.5 z-10">
          {mode === 'date' ? (
             <Calendar size={18} color="hsl(0, 0%, 70%)" />
          ) : (
             <Clock size={18} color="hsl(0, 0%, 70%)" />
          )}
        </View>
      </TouchableOpacity>
      
      {show && (
        <View className={Platform.OS === 'ios' ? 'mt-3 mb-2 px-2 pb-4 bg-muted/30 rounded-xl items-center border border-border/50' : ''}>
          {Platform.OS === 'ios' && (
             <View className="flex-row justify-end w-full mb-2 mt-3 pr-2">
                <TouchableOpacity onPress={() => setShow(false)}>
                   <Text className="text-primary font-bold text-sm tracking-wide uppercase">Confirm</Text>
                </TouchableOpacity>
             </View>
          )}
          <DateTimePicker
            value={dateObj}
            mode={mode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            textColor="#ffffff"
            themeVariant="dark"
            style={Platform.OS === 'ios' ? { height: 140, width: '100%' } : undefined}
          />
        </View>
      )}
    </View>
  );
}
