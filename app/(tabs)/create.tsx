import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

const CreateScreen = () => {

    const router = useRouter();
    const { user } = useUser();

    const [caption, setCaption] = useState("");
    const [first, setfirst] = useState(second)



    return (
        <View>
            <Text>Create</Text>
        </View>
    )
}

export default CreateScreen