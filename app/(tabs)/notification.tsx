import Loader from "@/components/Loader";
import { NotificationItem } from "@/components/NotificationItem";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/notification.styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import React from "react";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const NotificationScreen = () => {
    const notifications = useQuery(api.notifications.getNotifications);

    if (notifications === undefined) return <Loader />;
    if (notifications.length === 0) return <NoNotificationFound />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notification</Text>
            </View>

            <FlatList
                data={notifications}
                renderItem={({ item }) => <NotificationItem notification={item} />}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const NoNotificationFound = () => (
    <View style={[styles.container, styles.centered]}>
        <Ionicons name="notifications-outline" size={48} color={COLORS.primary} />
        <Text style={{ fontSize: 20, color: COLORS.white }}>
            No notifications yet
        </Text>
    </View>
);



export default NotificationScreen;
