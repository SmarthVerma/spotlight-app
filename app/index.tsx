import { View, Text } from 'react-native'
import React from 'react'
import { Redirect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

const index = () => {

    const { getToken } = useAuth()

    console.log('in index redirect')
    return <Redirect href={'/(auth)/login'} />
}

export default index