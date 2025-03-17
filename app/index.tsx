import { useAuth } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'
import React from 'react'

const index = () => {

    const { getToken } = useAuth()

    console.log('in index redirect')
    return <Redirect href={'/(auth)/login'} />
}

export default index