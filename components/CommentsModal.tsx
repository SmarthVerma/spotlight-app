import { View, Text, Modal, KeyboardAvoidingView, Touchable, TouchableOpacity, Platform, FlatList, TextInput, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQueries, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { styles } from '@/styles/feed.styles';
import Loader from './Loader';
import Comment from "@/components/Comment";

type CommentsModal = {
    postId: Id<"posts">;
    visible: boolean;
    onClose: () => void
    onCommentAdded: () => void
}

export default function CommentsModal({ onClose, onCommentAdded, postId, visible }: CommentsModal) {
    const [newComment, setNewComment] = useState("");
    const comments = useQuery(api.comments.getComments, { postId })
    const addComment = useMutation(api.comments.addComment)

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            console.log('adding comment',)
            await addComment({ postId: postId, content: newComment })

            setNewComment("");
            onCommentAdded()

        } catch (error) {

        }
    }



    return (
        <Modal visible={visible} animationType='slide' transparent={true} onRequestClose={onClose}>
            <KeyboardAvoidingView
                keyboardVerticalOffset={Platform.OS === "ios" ? 44 : 0}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalContainer}
            >
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name={"close"} size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Comments</Text>
                    <View style={{ width: 24 }} />
                </View>

                {comments == undefined ? (
                    <Loader />
                ) : (

                        <FlatList
                            style={{ flex: 1 }}  // Make sure it fills the width
                            data={comments}
                            keyExtractor={(item) => item._id}
                            renderItem={(item) => <Comment comment={item.item} />}
                            contentContainerStyle={styles.commentsList}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                            ListEmptyComponent={<Text style={styles.noComments}>No comments yet</Text>}
                        />
                )}

                <View style={styles.commentInput} >
                    <TextInput
                        style={styles.input}
                        placeholder='Add a comment...'
                        placeholderTextColor={COLORS.grey}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />

                    <TouchableOpacity onPress={handleAddComment} disabled={!newComment.trim()}>
                        <Text style={[styles.postButton, !newComment.trim() && styles.postButtonDisabled]}>
                            Post
                        </Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </Modal>
    )
}