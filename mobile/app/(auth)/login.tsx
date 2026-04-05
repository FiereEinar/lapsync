import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/useAuthStore";
import api from "../../src/api/axios";
import { MaterialIcons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/login", { email, password });
      await checkAuth();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      Alert.alert("Login Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className='flex-1 bg-zinc-950'
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View className='mb-12 mt-12'>
          <Text className='text-4xl font-extrabold text-white mb-2 tracking-tight'>
            Welcome Back
          </Text>
          <Text className='text-zinc-400 text-base'>
            Sign in to continue to Lapsync.
          </Text>
        </View>

        <View className='mb-8 flex flex-col gap-4'>
          <View className='flex-row items-center bg-zinc-900 rounded-2xl px-4 py-3 border border-zinc-800'>
            <MaterialIcons
              name='email'
              size={20}
              color='#9ca3af'
              style={{ marginRight: 12 }}
            />
            <TextInput
              className='flex-1 text-white text-base py-2'
              placeholder='Email address'
              placeholderTextColor='#6b7280'
              keyboardType='email-address'
              autoCapitalize='none'
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className='flex-row items-center bg-zinc-900 rounded-2xl px-4 py-3 border border-zinc-800'>
            <MaterialIcons
              name='lock'
              size={20}
              color='#9ca3af'
              style={{ marginRight: 12 }}
            />
            <TextInput
              className='flex-1 text-white text-base py-2'
              placeholder='Password'
              placeholderTextColor='#6b7280'
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <TouchableOpacity
          className={`bg-blue-600 rounded-2xl py-4 items-center flex-row justify-center ${isLoading ? "opacity-70" : ""}`}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text className='text-white text-lg font-bold tracking-wide mr-2'>
            {isLoading ? "Signing In..." : "Sign In"}
          </Text>
          {!isLoading && (
            <MaterialIcons name='arrow-forward' size={20} color='white' />
          )}
        </TouchableOpacity>

        <View className='flex-row justify-center mt-12'>
          <Text className='text-zinc-400 mr-2'>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text className='text-blue-500 font-semibold text-base'>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
