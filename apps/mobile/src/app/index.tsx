import React, { useEffect } from 'react';
import { View, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '@/services';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndNavigation() {
      const token = await storage.getToken();
      const hasSeenOnboarding = await storage.getHasSeenOnboarding();

      setTimeout(() => {
        if (token) {
          // Usuario ya autenticado -> Redirigir a Home directamente
          router.replace('/(tabs)/home');
        } else if (hasSeenOnboarding) {
          // Ya vio el onboarding previamente -> Ir al Login
          router.replace('/auth/login');
        } else {
          // Primera vez ingresando a la app -> Ir al Onboarding
          router.replace('/onboarding');
        }
      }, 2000);
    }

    checkAuthAndNavigation();
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0C0A07' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0C0A07" translucent />
      <Image
        source={require('../../assets/brand/01_Splash.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </View>
  );
}
