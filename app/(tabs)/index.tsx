import Loader from "@/components/Loader";
import Post from "@/components/Post";
import Story from "@/components/Story";
import { STORIES } from "@/constants/mock-data";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useConvex, useQuery } from "convex/react";
import { set } from "date-fns";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function Index() {
  const { signOut } = useAuth();
  const convex = useConvex().watchQuery;
  const posts = useQuery(api.posts.getFeedPosts, {});
  const [refreshing, setRefreshing] = useState(false);

  // Animation values for scroll handling
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerVisible = useRef(new Animated.Value(1)).current; // 0 for hidden, 1 for visible
  const headerHeight = 56; // Based on your styles
  const headerVisibilityThreshold = 10; // Minimum scroll distance to trigger header visibility change

  if (posts === undefined) return <Loader />;
  if (posts.length == 0) return <NoPostsFound />;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setTimeout(() => {
        setRefreshing(false);
      }, 3000);
    } catch (error) {
      console.error("Error refreshing posts:", error);
    } finally {

    }
  };

  // This controls the header translation - header slides up (hidden) or down (visible)
  const headerTranslateY = headerVisible.interpolate({
    inputRange: [0, 1],
    outputRange: [-headerHeight, 0], // Move up (hidden) when scrolling down, show when scrolling up
    extrapolate: 'clamp'
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const diff = currentScrollY - lastScrollY.current;

        // Only change header visibility if we've scrolled more than the threshold
        if (Math.abs(diff) > headerVisibilityThreshold) {
          // Scrolling down and past header height - hide header
          if (diff > 0 && currentScrollY > headerHeight) {
            Animated.timing(headerVisible, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true
            }).start();
          }
          // Scrolling up - show header
          else if (diff < 0) {
            Animated.timing(headerVisible, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true
            }).start();
          }

          lastScrollY.current = currentScrollY;
        }
      }
    }
  );


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      {/* Header - Only shows when scrolling up */}
      <Animated.View
        style={[
          styles.header,
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: COLORS.background,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}
      >
        <Text style={styles.headerTitle}>spotlight</Text>
        <TouchableOpacity>
          <Ionicons
            name="log-out-outline"
            size={24}
            color={COLORS.white}
            onPress={() => {
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
            }}
          />
        </TouchableOpacity>
      </Animated.View>

      <Animated.FlatList
        contentContainerStyle={{
          paddingTop: headerHeight, // Add padding to account for header
          paddingBottom: 60
        }}
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <Post post={item} />}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16} // For smooth animation
        ListHeaderComponent={<StoriesSection />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
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
  );
};

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
);