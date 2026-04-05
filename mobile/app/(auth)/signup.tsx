import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../src/api/axios';
import { MaterialIcons } from '@expo/vector-icons';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post('/auth/signup', { name, email, password, confirmPassword });
      
      Alert.alert('Welcome!', 'Your account has been created successfully. Please log in.');
      router.replace('/(auth)/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-zinc-950"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <TouchableOpacity className="mb-6 mt-8" onPress={() => router.back()}>
          <View className="bg-zinc-900 w-10 h-10 rounded-full items-center justify-center border border-zinc-800">
            <MaterialIcons name="arrow-back" size={20} color="#9ca3af" />
          </View>
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-4xl font-extrabold text-white mb-2 tracking-tight">Create Account</Text>
          <Text className="text-zinc-400 text-base">Sign up to get started with Lapsync.</Text>
        </View>

        <View className="mb-8 flex flex-col gap-4">
          <View className="flex-row items-center bg-zinc-900 rounded-2xl px-4 py-3 border border-zinc-800">
            <MaterialIcons name="person" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
            <TextInput
              className="flex-1 text-white text-base py-2"
              placeholder="Full Name"
              placeholderTextColor="#6b7280"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="flex-row items-center bg-zinc-900 rounded-2xl px-4 py-3 border border-zinc-800">
            <MaterialIcons name="email" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
            <TextInput
              className="flex-1 text-white text-base py-2"
              placeholder="Email address"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          
          <View className="flex-row items-center bg-zinc-900 rounded-2xl px-4 py-3 border border-zinc-800">
            <MaterialIcons name="lock" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
            <TextInput
              className="flex-1 text-white text-base py-2"
              placeholder="Password"
              placeholderTextColor="#6b7280"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View className="flex-row items-center bg-zinc-900 rounded-2xl px-4 py-3 border border-zinc-800">
            <MaterialIcons name="lock-outline" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
            <TextInput
              className="flex-1 text-white text-base py-2"
              placeholder="Confirm Password"
              placeholderTextColor="#6b7280"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>

        <TouchableOpacity 
          className={`bg-blue-600 rounded-2xl py-4 mt-2 items-center justify-center ${isLoading ? 'opacity-70' : ''}`}
          onPress={handleSignup}
          disabled={isLoading}
        >
          <Text className="text-white text-lg font-bold tracking-wide">
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-12">
          <Text className="text-zinc-400 mr-2">Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text className="text-blue-500 font-semibold text-base">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
