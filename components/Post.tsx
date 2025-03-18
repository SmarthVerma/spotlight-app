import { View, Text, TouchableOpacity, ActivityIndicator, Animated } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { styles } from "@/styles/feed.styles";
import { Link } from 'expo-router';
import { Image } from "expo-image";
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { Id } from '@/convex/_generated/dataModel';
import CommentsModal from './CommentsModal'; // Adjust the path as needed
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { formatDistanceToNow } from 'date-fns';
import { useStoredAuth } from '@/providers/AuthContext';
import { TapGestureHandler, State } from 'react-native-gesture-handler';


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
    const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked)
    const [commentsCount, setCommentsCount] = useState(post.comments)
    const [showComments, setShowComments] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const { authUserId } = useStoredAuth()
    const [gotLiked, setGotLiked] = useState(false)


    // Animation values
    const heartScale = useRef(new Animated.Value(0)).current
    const heartOpacity = useRef(new Animated.Value(0)).current

    // Double tap gesture handler ref
    const doubleTapRef = useRef(null)

    const toggleLike = useMutation(api.posts.toggleLike)
    const toggleBookmark = useMutation(api.bookmarks.toggleBookmark)
    const deletePost = useMutation(api.posts.deletePost)

    // Handle the heart animation when gotLiked changes
    useEffect(() => {
        if (gotLiked) {
            // Reset animation values
            heartOpacity.setValue(0)
            heartScale.setValue(0)

            // Run the animation sequence
            Animated.sequence([
                // Show the heart and start scaling it up
                Animated.parallel([
                    Animated.timing(heartOpacity, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true
                    }),
                    Animated.spring(heartScale, {
                        toValue: 1,
                        friction: 4,
                        tension: 100,
                        useNativeDriver: true
                    })
                ]),
                // Delay before hiding
                Animated.delay(300),
                // Fade out
                Animated.timing(heartOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                })
            ]).start(() => {
                // Reset the gotLiked state after animation completes
                setGotLiked(false)
            })
        }
    }, [gotLiked])

    const handleLike = async () => {
        try {
            // If we're going from not liked to liked, trigger the animation
            if (!isLiked) {
                setGotLiked(true)
            }

            const newIsLiked = await toggleLike({ postId: post._id })
            setIsLiked(newIsLiked)
        } catch (error) {
            console.log("Error liking the post", error)
        }
    }

    // Handle double tap with gesture handler
    const onDoubleTap = ({ nativeEvent }: { nativeEvent: { state: number } }) => {
        if (nativeEvent.state === State.ACTIVE) {
            if (!isLiked) {
                setGotLiked(true)
                handleLike()
            }
        }
    }

    const handleBookmark = async () => {
        try {
            await toggleBookmark({ postId: post._id })
            setIsBookmarked((prev) => !prev)
        } catch (error) {
            console.log("Error bookmarking the post", error)
        }
    }

    const handleDeletePost = async () => {
        try {
            setIsDeleting(true)
            await deletePost({ postId: post._id })
        } catch (error) {
            console.log("Error deleting the post", error)
        }
        finally {
            setIsDeleting(false)
        }
    }

    return (
        <View style={styles.post} >
            <View style={styles.postHeader}>
                <Link href={authUserId === post.author.id ? "/(tabs)/profile": `/user/${post.author.id}`} asChild >
                    <TouchableOpacity style={styles.postHeaderLeft}>
                        <Image
                            source={post?.author?.image}
                            style={styles.postAvatar}
                            contentFit="cover"
                            transition={200}
                            cachePolicy={"memory-disk"}
                        />
                        <Text style={styles.postUsername}>
                            {post?.author?.username}
                        </Text>
                    </TouchableOpacity>
                </Link>

                {/* If owner show delete button */}
                {authUserId === post.author.id ? (
                    <TouchableOpacity disabled={isDeleting} onPress={handleDeletePost}>
                        {isDeleting ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                            <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
                        )}
                    </TouchableOpacity>
                ) : (<TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white} />
                </TouchableOpacity>)}
            </View>

            {/* IMAGE with double tap handler using gesture handler */}
            <TapGestureHandler
                ref={doubleTapRef}
                numberOfTaps={2}
                onHandlerStateChange={onDoubleTap}
            >
                <Animated.View style={styles.imageContainer}>
                    <Image
                        source={post.imageUrl}
                        style={styles.postImage}
                        contentFit="cover"
                        transition={200}
                        cachePolicy={"memory-disk"}
                    />

                    {/* Heart animation overlay */}
                    <Animated.View
                        style={[
                            styles.heartAnimationContainer,
                            {
                                opacity: heartOpacity,
                                transform: [{ scale: heartScale }]
                            }
                        ]}
                    >
                        <Ionicons name="heart" size={80} color={COLORS.primary} />
                    </Animated.View>
                </Animated.View>
            </TapGestureHandler>

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
                <TouchableOpacity onPress={handleBookmark}>
                    <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={22} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* POST INFO */}
            <View style={styles.postInfo}>
                <Text style={styles.likesText}>
                    {post.likes > 0 ? `${post.likes.toLocaleString()} likes` : "Be the first to like"}
                </Text>
                {post.caption && (
                    <View style={styles.captionContainer}>
                        <Text style={styles.captionUsername}>{post.author.username}</Text>
                        <Text style={styles.captionText}>{post.caption}</Text>
                    </View>
                )}

                {commentsCount > 0 && (<TouchableOpacity onPress={() => setShowComments(true)}>
                    <Text style={styles.commentsText}>
                        View all {commentsCount} comments
                    </Text>
                </TouchableOpacity>)}

                <Text style={styles.timeAgo}>
                    {formatDistanceToNow(new Date(post._creationTime), { addSuffix: true })}
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