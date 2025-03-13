import { useAuth } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Alert, Text, View, TouchableOpacity } from "react-native";

export default function Index() {

  const { signOut } = useAuth()

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TouchableOpacity style={{ padding: 20,borderRadius: 20 ,backgroundColor: "red" }}
        onPress={() => signOut()}
      >
        <Text>

        Sign out
        </Text>
      </TouchableOpacity>

      < Text > Home screen</Text>

    </View >
  );
}
