import Loader from "@/components/Loader";
import Post from "@/components/Post";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useConvex, useQuery } from "convex/react";
import { useState, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Animated,
  StatusBar
} from "react-native";

const BookmarkScreen = () => {
  const convex = useConvex();
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarks)[0];
  const [refreshing, setRefreshing] = useState(false);

  // Animation values for scroll handling
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerVisible = useRef(new Animated.Value(1)).current;
  const headerHeight = 56;
  const headerVisibilityThreshold = 10;

  if (bookmarkedPosts === undefined) return <Loader />;
  if (bookmarkedPosts.length === 0) return <NoBookmarksFound />;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await convex.query(api.bookmarks.getBookmarks);
    } catch (error) {
      console.error("Error refreshing bookmarks:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Header translation control
  const headerTranslateY = headerVisible.interpolate({
    inputRange: [0, 1],
    outputRange: [-headerHeight, 0],
    extrapolate: 'clamp'
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const diff = currentScrollY - lastScrollY.current;

        if (Math.abs(diff) > headerVisibilityThreshold) {
          if (diff > 0 && currentScrollY > headerHeight) {
            Animated.timing(headerVisible, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true
            }).start();
          }
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
        <Text style={styles.headerTitle}>bookmarks</Text>
        <TouchableOpacity>
          <Ionicons
            name="trash-outline"
            size={24}
            color={COLORS.white}
            onPress={() => {
              // Add functionality to clear all bookmarks if needed
            }}
          />
        </TouchableOpacity>
      </Animated.View>

      <Animated.FlatList
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: 60
        }}
        data={bookmarkedPosts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <Post post={item} />}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
};

const NoBookmarksFound = () => (
  <View style={{
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <Text style={{ fontSize: 20, color: COLORS.primary }}>
      No Bookmarks yet
    </Text>
    <Text style={{ fontSize: 16, color: COLORS.white, marginTop: 10, textAlign: 'center', paddingHorizontal: 20 }}>
      Posts you bookmark will appear here
    </Text>
  </View>
);

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
};

export default BookmarkScreen;