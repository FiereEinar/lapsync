import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../src/api/axios';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";

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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
        <Card className="w-full max-w-sm mx-auto">
          <CardHeader className="items-center pb-8 mt-2">
            <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
            <CardDescription className="text-center">Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <View>
              <Text className="text-sm font-medium leading-none text-foreground mb-3">Full Name</Text>
              <Input
                placeholder="John Doe"
                autoCapitalize="words"
                textContentType="name"
                autoComplete="name"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View>
              <Text className="text-sm font-medium leading-none text-foreground mb-3">Email</Text>
              <Input
                placeholder='m@example.com'
                keyboardType='email-address'
                autoCapitalize='none'
                textContentType="emailAddress"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View>
              <Text className="text-sm font-medium leading-none text-foreground mb-3">Password</Text>
              <Input
                placeholder='Password'
                secureTextEntry
                textContentType="newPassword"
                autoComplete="password-new"
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <View>
              <Text className="text-sm font-medium leading-none text-foreground mb-3">Confirm Password</Text>
              <Input
                placeholder='Confirm Password'
                secureTextEntry
                textContentType="newPassword"
                autoComplete="password-new"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
            <Button className="mt-4 w-full" onPress={handleSignup} disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create an account"}
            </Button>
          </CardContent>
          <CardFooter className="justify-center mt-2 pb-8">
             <Text className='text-muted-foreground text-sm mr-2'>Already have an account?</Text>
             <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
               <Text className='text-primary font-semibold text-sm'>Sign in</Text>
             </TouchableOpacity>
          </CardFooter>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
