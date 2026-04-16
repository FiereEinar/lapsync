import React from 'react';
import { View, Text } from 'react-native';

const statusConfig: Record<string, { label: string, containerClass: string, textClass: string }> = {
  active: { label: 'Active', containerClass: 'bg-emerald-500/10 border-0', textClass: 'text-emerald-500' },
  upcoming: { label: 'Upcoming', containerClass: 'bg-primary/10 border-0', textClass: 'text-primary' },
  finished: { label: 'Finished', containerClass: 'bg-muted border-0', textClass: 'text-muted-foreground' },
  cancelled: { label: 'Cancelled', containerClass: 'bg-red-500/10 border-0', textClass: 'text-red-500' },
  pending: { label: 'Pending', containerClass: 'bg-amber-500/10 border-0', textClass: 'text-amber-500' },
  accepted: { label: 'Accepted', containerClass: 'bg-emerald-500/10 border-0', textClass: 'text-emerald-500' },
  completed: { label: 'Completed', containerClass: 'bg-muted border-0', textClass: 'text-muted-foreground' },
  running: { label: 'Running', containerClass: 'bg-emerald-500/10 border-0', textClass: 'text-emerald-500' },
  ongoing: { label: 'Ongoing', containerClass: 'bg-emerald-500/10 border-0', textClass: 'text-emerald-500' },
};

export function StatusBadge({ status, className = '' }: { status: string, className?: string }) {
  const config = statusConfig[status?.toLowerCase()] || { label: status, containerClass: 'bg-muted', textClass: 'text-muted-foreground' };
  
  return (
    <View className={`px-2.5 py-1 rounded-full ${config.containerClass} ${className}`}>
      <Text className={`font-bold text-[10px] uppercase tracking-wider ${config.textClass}`}>
        {config.label || status}
      </Text>
    </View>
  );
}
