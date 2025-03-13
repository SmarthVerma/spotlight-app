import { Stack } from "expo-router";
import React from "react";
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { tokenCache } from "@/cache";
import InitialLayout from "@/components/InitialLayout";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { Text } from "react-native";

export default function RootLayout() {



  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
          <InitialLayout />
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkAndConvexProvider>
  )
}
