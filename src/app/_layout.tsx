import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router/stack';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { appFonts } from '../components/AppText';
import { LoginSheet } from '../components/LoginSheet';
import { SideMenu } from '../components/SideMenu';
import { Splash } from '../components/Splash';
import { SessionProvider } from '../context/session';

const SPLASH_MS = 1600;

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded, fontError] = useFonts(appFonts);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  // Le splash reste affiché tant que les polices ne sont pas prêtes.
  if (!fontsLoaded && !fontError) return <Splash />;

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="live/[id]" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
        <SideMenu />
        <LoginSheet />
        {showSplash && <Splash />}
      </SessionProvider>
    </SafeAreaProvider>
  );
}
