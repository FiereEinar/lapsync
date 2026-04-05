import React, { useState } from "react";
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/useAuthStore";
import api from "../../src/api/axios";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";

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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className='flex-1 bg-background'>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 16 }}>
        <Card className="w-full max-w-sm mx-auto">
          <CardHeader className="items-center pb-8 mt-2">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription className="text-center">Enter your email below to login to your account.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <View>
              <Text className="text-sm font-medium leading-none text-foreground mb-3">Email</Text>
              <Input
                placeholder='m@example.com'
                keyboardType='email-address'
                autoCapitalize='none'
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View>
              <Text className="text-sm font-medium leading-none text-foreground mb-3">Password</Text>
              <Input
                placeholder='Password'
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <Button className="mt-4 w-full" onPress={handleLogin} disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </CardContent>
          <CardFooter className="justify-center mt-2 pb-8">
             <Text className='text-muted-foreground text-sm mr-2'>Don't have an account?</Text>
             <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
               <Text className='text-primary font-semibold text-sm'>Sign up</Text>
             </TouchableOpacity>
          </CardFooter>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
