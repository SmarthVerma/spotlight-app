import { StyleSheet, Text, View } from 'react-native'
import React, { Children } from 'react'
import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { tokenCache } from '@/cache'

export default function ClerkAndConvexProvider({ children }: { children: React.ReactNode }) {

    const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
        unsavedChangesWarning: false
    })

    const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!
    console.log('tjhi is ', publishableKey, tokenCache)
    if (!publishableKey) {
        throw new Error(
            'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
        )
    }
    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
            <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
                <View style={{ flex: 1 }}>
                    <ClerkLoaded>
                        {children}
                    </ClerkLoaded>
                </View>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    )
}

const styles = StyleSheet.create({})