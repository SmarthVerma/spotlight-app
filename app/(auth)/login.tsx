import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useSSO } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { styles } from '@/styles/auth.styles'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'

const login = () => {
    const { startSSOFlow } = useSSO()
    const router = useRouter()

    const handleGoogleSignin = async () => {
        console.log('clicked',)
        try {
            const { createdSessionId, setActive } = await startSSOFlow({ strategy: "oauth_google" })
            if (setActive && createdSessionId) {
                setActive({ session: createdSessionId })
                router.push('/(tabs)')
            }
        } catch (error) {
            console.log('Oauth Error', error)
        }
    }

    return (
        <View style={styles.container}>
            {/* Branding Section */}
            <View style={styles.brandSection}>
                <View style={styles.logoContainer}>
                    <Ionicons name="leaf" size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.appName}>Spotlight</Text>
                <Text style={styles.tagline} >Your daily dose of inspiration</Text>
            </View>

            {/* Illustration Section */}
            <View style={styles.illustrationContainer}>
                <Image source={require("@/assets/logo.png")} style={styles.illustration} resizeMode='cover' />
            </View>

            {/* LOGIN SECTION */}

            <View style={styles.loginSection}>
                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignin} activeOpacity={0.9}>
                    <View style={styles.googleIconContainer}>
                        <Ionicons name="logo-google" size={20} color={COLORS.surface} />
                    </View>
                    <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </TouchableOpacity>

                <Text style={styles.termsText}>
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </Text>

            </View>
        </View>
    )
}

export default login