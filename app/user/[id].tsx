import { View, Text, TouchableOpacity, ScrollView, Pressable, FlatList } from 'react-native'
import React, { useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Id } from '@/convex/_generated/dataModel'
import Loader from '@/components/Loader'
import { isFollowing } from '@/convex/users'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'
import { styles } from '@/styles/profile.styles'
import { Image } from "expo-image";
import { useStoredAuth } from '@/providers/AuthContext'

export default function UserProfileScreeb() {

    const { id } = useLocalSearchParams()
    const profile = useQuery(api.users.getUserProfile, { userId: id as Id<"users"> })
    const posts = useQuery(api.posts.getPostsByUser, { userId: id as Id<"users"> })
    const isFollowing = useQuery(api.users.isFollowing, { userId: id as Id<"users"> })
    const router = useRouter()
    const toggleFollow = useMutation(api.users.toggleFollow)

    console.log('this is POSTS!!', posts)
    const handleBack = () => {
        if (router.canGoBack()) {
            router.back()
        } else {
            router.push("/(tabs)")
        }
    }

    const authUserId = useStoredAuth().authUserId

    useEffect(() => {
        if (authUserId == id) {
            router.push("/(tabs)/profile")
        }
    }, [])


    if (!profile == undefined || posts == undefined || isFollowing == undefined) return <Loader />;
    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {profile?.username}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.profileInfo}>
                    <View style={styles.avatarAndStats}>
                        <Image
                            source={profile?.image}
                            style={styles.avatar}
                            contentFit="cover"
                            cachePolicy={"memory-disk"}
                        />

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{profile?.posts}</Text>
                                <Text style={styles.statLabel}>Posts</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{profile?.followers}</Text>
                                <Text style={styles.statLabel}>Followers</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{profile?.following}</Text>
                                <Text style={styles.statLabel}>Following</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.name}>{profile?.fullName}</Text>
                    {profile?.bio && <Text style={styles.bio}>{profile?.bio}</Text>}

                    <Pressable
                        onPress={() => {
                            toggleFollow({ followingId: id as Id<"users"> })
                        }}
                        style={[styles.followButton, isFollowing && styles.followingButton]}
                    >
                        <Text style={styles.followButtonText}>
                            {isFollowing ? "Following" : "Follow"}
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.postsGrid}>
                    {posts.length === 0 ? (
                        <View>
                            <Ionicons name="images-outline" size={48} color={COLORS.primary} />
                            <Text style={styles.noPostsText}>
                                No Posts yet
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={posts}
                            numColumns={3}
                            scrollEnabled={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.gridItem}>
                                    <Image
                                        source={item.imageUrl}
                                        style={styles.gridImage}
                                        contentFit="cover"
                                        transition={200}
                                        cachePolicy={"memory-disk"}
                                    />
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item._id}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    )
}