import { View, Text, TouchableOpacity, Touchable } from 'react-native'
import React, { useState } from 'react'
import { styles } from "@/styles/feed.styles";
import { Link } from 'expo-router';
import { Image } from "expo-image";
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { Id } from '@/convex/_generated/dataModel';
import CommentsModal from './CommentsModal'; // Adjust the path as needed
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';


type PostProps = {
    post: {
        _id: Id<"posts">;
        imageUrl: string;
        caption?: string | undefined;
        likes: number;
        comments: number;
        _creationTime: number;
        isLiked: boolean;
        isBookmarked: boolean;
        author: {
            id: string,
            username: string,
            image: string
        }
    }

}

export default function Post({ post }: PostProps) {
    const [isLiked, setIsLiked] = useState(post.isLiked)
    const [likesCount, setLikesCount] = useState(post.likes)
    const [commentsCount, setCommentsCount] = useState(post.comments)
    const [showComments, setShowComments] = useState(false)

    const toggleLike = useMutation(api.posts.toggleLike)

    const handleLike = async () => {
        try {
            const newIsLiked = await toggleLike({ postId: post._id })
            setIsLiked(newIsLiked)
            setLikesCount((count) => (newIsLiked ? count + 1 : count - 1))
        } catch (error) {

        }
    }

    return (
        <View style={styles.post} >
            <View style={styles.postHeader}>
                <Link href="/(tabs)/notification" asChild >
                    <TouchableOpacity style={styles.postHeaderLeft}>
                        <Image
                            source={post.author.image}
                            style={styles.postAvatar}
                            contentFit="cover"
                            transition={200}
                            cachePolicy={"memory-disk"}
                        />
                        <Text style={styles.postUsername}>
                            {post.author.username}
                        </Text>
                    </TouchableOpacity>
                </Link>

                {/* If owner show delete button */}
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white} />
                </TouchableOpacity>

            </View>

            {/* IMAGE */}

            <Image
                source={post.imageUrl}
                style={styles.postImage}
                contentFit="cover"
                transition={200}
                cachePolicy={"memory-disk"}

            />
            {/* POST ACTIONS */}
            <View style={styles.postActions}>
                <View style={styles.postActionsLeft}>
                    <TouchableOpacity onPress={handleLike}>
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={24}
                            color={isLiked ? COLORS.primary : COLORS.white}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowComments(true)}>
                        <Ionicons
                            name="chatbubble-outline"
                            size={22}
                            color={COLORS.white}
                        />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity>
                    <Ionicons name={"bookmark-outline"} size={22} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            {/* POST INFO */}
            <View style={styles.postInfo}>
                <Text style={styles.likesText}>
                    {likesCount > 0 ? `${likesCount.toLocaleString()} likes` : "Be the first to like"}
                </Text>
                {post.caption && (
                    <View style={styles.captionContainer}>
                        <Text style={styles.captionUsername}>{post.author.username}</Text>
                        <Text style={styles.captionText}>{post.caption}</Text>
                    </View>
                )}

                <TouchableOpacity>
                    <Text style={styles.commentsText}>
                        View all {commentsCount} comments
                    </Text>
                </TouchableOpacity>

                <Text style={styles.timeAgo}>
                    2 hours ago
                </Text>
            </View>

            <CommentsModal
                postId={post._id}
                visible={showComments} // might not add
                onClose={() => setShowComments(false)}
                onCommentAdded={() => setCommentsCount((prev => prev + 1))}

            />

        </View>
    )
}