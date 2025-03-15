import { SplashScreen, Stack } from "expo-router";
import React, { useCallback } from "react";
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { tokenCache } from "@/cache";
import InitialLayout from "@/components/InitialLayout";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const [fontsLoaded] = useFonts({
    "JetBrainsMono-medium": require("@/assets/fonts/JetBrainsMono-Medium.ttf"),
  })


  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} onLayout={onLayoutRootView}>
        <InitialLayout />
        <StatusBar style='auto' />
      </SafeAreaView>
    </SafeAreaProvider>
    </ClerkAndConvexProvider >
  )
}
