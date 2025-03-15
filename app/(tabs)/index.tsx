import Loader from "@/components/Loader";
import Post from "@/components/Post";
import Story from "@/components/Story";
import { STORIES } from "@/constants/mock-data";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useConvex, useMutation, useQuery } from "convex/react";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text, View, TouchableOpacity, ScrollView, FlatList, RefreshControl } from "react-native";

export default function Index() {

  const { signOut } = useAuth()
  const convex = useConvex()
  const posts = useQuery(api.posts.getFeedPosts, {})
  const [refreshing, setRefreshing] = useState(false)
  if (posts === undefined) return <Loader />

  if (posts.length == 0) return <NoPostsFound />

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await convex.query(api.posts.getFeedPosts, {});
    } catch (error) {
      console.error("Error refreshing posts:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container} >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle} >spotlight</Text>
        <TouchableOpacity>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} onPress={() => {
            Alert.alert(
              "Sign out",
              "Are you sure you want to sign out?",
              [
                {
                  text: "Cancel",
                  onPress: () => console.log("Cancel Pressed"),
                  style: "cancel"
                },
                { text: "OK", onPress: () => signOut() }
              ]
            );
          }} />
        </TouchableOpacity>
      </View>

      {/* STORIES */}


      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <Post post={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={<StoriesSection />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.white}
          />
        }
      />

    </View>
  );
}

const StoriesSection = () => {
  return (
    <ScrollView
      style={styles.storiesContainer}
      horizontal
      bounces={true}
      showsHorizontalScrollIndicator={false}
    >
      {STORIES.map((story) => (
        <Story key={story.id} story={story} />
      ))}
    </ScrollView>
  )
}



const NoPostsFound = () => (
  <View style={{
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <Text style={{ fontSize: 20, color: COLORS.primary }}>
      No Posts yet
    </Text>
  </View>
)