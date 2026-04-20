import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export function RaceCategoryTable({ categories }: { categories: any[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <View className="bg-card border border-border/60 rounded-2xl overflow-hidden">
       <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
             {/* Header */}
             <View className="flex-row bg-muted/20 border-b border-border/50 px-5 py-3.5">
                <Text className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-36">Category</Text>
                <Text className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-24">Distance</Text>
                <Text className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-24">Cutoff</Text>
                <Text className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-24">Slots</Text>
                <Text className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-24">Registered</Text>
                <Text className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-24 text-right">Price</Text>
             </View>
             {/* Rows */}
             {categories.map((cat, i) => (
                <View key={i} className="flex-row items-center border-b border-border/20 px-5 py-4">
                   <Text className="font-bold text-foreground text-sm w-36" numberOfLines={1}>{cat.name}</Text>
                   <Text className="text-foreground text-sm font-mono w-24 font-medium">{cat.distanceKm}K</Text>
                   <Text className="text-muted-foreground text-sm font-mono w-24">{cat.cutoffTime ? `${cat.cutoffTime}m` : '-'}</Text>
                   <Text className="text-foreground text-sm font-medium w-24">{cat.slots}</Text>
                   <Text className="text-foreground text-sm font-medium w-24">{cat.registeredCount}</Text>
                   <Text className="text-primary font-bold text-sm w-24 text-right">₱{cat.price}</Text>
                </View>
             ))}
          </View>
       </ScrollView>
    </View>
  );
}
