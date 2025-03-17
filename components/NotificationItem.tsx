import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/notification.styles";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { Link } from "expo-router";
import { View, TouchableOpacity, Text } from "react-native";
import { Image } from "expo-image";


// maybe write type for props
export const NotificationItem = ({ notification }: { notification: any }) => {
    console.log(`notification`, notification);
    return (
        <View style={styles.notificationItem}>
            <View style={styles.notificationContent}>
                <Link href={`/(tabs)/create`} asChild>
                    <TouchableOpacity style={styles.avatarContainer}>
                        <Image
                            source={notification?.sender?.image}
                            style={styles.avatar}
                            contentFit="cover"
                            transition={200}
                        />
                        <View style={styles.iconBadge}>
                            {notification?.type === "like" ? (
                                <Ionicons name="heart" size={12} color={COLORS.primary} />
                            ) : notification?.type === "comment" ? (
                                <Ionicons name="person-add" size={12} color={"#8B5CF6"} />
                            ) : (
                                <Ionicons name="chatbubble" size={12} color={"#3B82F6"} />
                            )}
                        </View>
                    </TouchableOpacity>
                </Link>

                <View style={styles.notificationInfo}>
                    <Link href={"/notification"} asChild>
                        <TouchableOpacity>
                            <Text style={styles.username}>
                                {notification?.sender.username}
                            </Text>
                        </TouchableOpacity>
                    </Link>
                    <Text style={styles.action}>
                        {notification?.type === "follow"
                            ? "started following you"
                            : notification?.type === "like"
                                ? "liked your post"
                                : `commented: "${"COMING"}`}
                    </Text>
                    <Text style={styles.timeAgo}>

                        {formatDistanceToNow(new Date(notification?._creationTime))}
                    </Text>
                </View>
                <View>
                    {notification.post && (
                        <Image
                            source={notification.post.imageUrl}
                            style={styles.postImage}
                            contentFit="cover"
                            transition={200}
                        />
                    )}
                </View>
            </View>
        </View>
    );
};
