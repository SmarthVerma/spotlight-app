import InitialLayout from "@/components/InitialLayout";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
        <GestureHandlerRootView>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} onLayout={onLayoutRootView}>
            <InitialLayout />
            <StatusBar style='auto' />
          </SafeAreaView>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ClerkAndConvexProvider >
  )
}
