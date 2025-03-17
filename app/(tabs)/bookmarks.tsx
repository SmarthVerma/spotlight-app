import Loader from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import {
  FlatList,
  Text,
  View
} from "react-native";

const BookmarkScreen = () => {
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarks);


  if (bookmarkedPosts === undefined) return <Loader />;
  if (bookmarkedPosts.length === 0) return <NoBookmarksFound />;


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmark</Text>
      </View>
      {/* content */}

      <View style={{ flex: 1, padding: 4 }}>
        <FlatList
          data={bookmarkedPosts}
          keyExtractor={(item) => item._id}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          columnWrapperStyle={{ gap: 4 }}
          renderItem={({ item }) => (
            <Image
              source={item.imageUrl}
              style={{ width: '33%', aspectRatio: 1, borderRadius: 3 }}
              contentFit="cover"
              transition={200}
              cachePolicy={"memory-disk"}
            />
          )}
          numColumns={3}
        />

      </View>
    </View>
  );
};

const NoBookmarksFound = () => (
  <View style={{
    flex: 1,
    backgroundColor: COLORS.background,
  }}>
    
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
      <Text style={{ fontSize: 20, color: COLORS.primary, fontWeight: '600', textAlign: 'center' }}>
        No Bookmarks yet
      </Text>
      <Text style={{ fontSize: 16, color: COLORS.grey, marginTop: 10, textAlign: 'center', paddingHorizontal: 20, }}>
        Your bookmarks will appear here
      </Text>
    </View>
  </View>
);



export default BookmarkScreen;