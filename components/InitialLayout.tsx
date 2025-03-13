import React, { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo';
import { Text } from "react-native";

const InitialLayout = () => {
    const segments = useSegments();
    const router = useRouter();
    const { isLoaded, isSignedIn } = useAuth();


    useEffect(() => {
        if (!isLoaded) return;

        const inAuthScreen = segments[0] === '(auth)';

        if (!isSignedIn && !inAuthScreen) {
            router.replace('/(auth)/login');
        } else if (isSignedIn && inAuthScreen) {
            router.replace('/(tabs)');
        }
    }, [isLoaded, isSignedIn, segments]);

    if (!isLoaded) return null;

    return <Stack screenOptions={{ headerShown: false }} />
}

export default InitialLayout