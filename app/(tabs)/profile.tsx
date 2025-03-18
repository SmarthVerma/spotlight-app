import { View, Text, TouchableOpacity, Modal, Keyboard, KeyboardAvoidingView, Platform, TextInput, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import Loader from '@/components/Loader';
import { styles } from '@/styles/profile.styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { Image } from "expo-image";

const ProfileScreen = () => {
  const { signOut, userId } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const currentUser = useQuery(api.users.getUserByClerkId, userId ? { clerkId: userId } : 'skip')

  const [editatedProfile, setEditatedProfile] = useState({
    fullName: currentUser?.fullName || "",
    bio: currentUser?.bio || "",
  })
  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null)

  const posts = useQuery(api.posts.getPostsByUser, {})
  const updateProfile = useMutation(api.users.updateProfile)

  console.log('posts', posts?.length)

  const handleSaveProfile = async () => {
    await updateProfile(editatedProfile)
    setIsEditModalVisible(false)
  }

  if (!currentUser || posts === undefined) return <Loader />


  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>{currentUser.username}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          {/* AVATAR & STATS */}
          <View style={styles.avatarAndStats}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: currentUser.image }}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <Text style={styles.name}>{currentUser.fullName}</Text>
          {currentUser.bio && <Text style={styles.bio}>{currentUser.bio}</Text>}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditModalVisible(true)}>
              <Text style={styles.editButtonText}>
                Edit Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} >
              <Ionicons name='share-outline' size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {posts.length === 0 && (<NoPostsFound />)}

        <FlatList
          data={posts}
          numColumns={3}
          scrollEnabled={false}
          nestedScrollEnabled={true}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedPost(item)}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.gridImage}
                contentFit="cover"
                transition={200}
              />
            </TouchableOpacity>
          )}
        />
      </ScrollView>


      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editatedProfile.fullName}
                  onChangeText={(text) => setEditatedProfile({ ...editatedProfile, fullName: text })}
                  placeholderTextColor={COLORS.grey}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={editatedProfile.bio}
                  onChangeText={(text) => setEditatedProfile({ ...editatedProfile, bio: text })}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={COLORS.grey}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  handleSaveProfile();
                  setIsEditModalVisible(false);
                }}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>


      {/* Selected IMAGE MODAL */}

      <Modal
        visible={!!selectedPost}
        animationType='fade'
        transparent={true}

        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalBackdrop} >
          {selectedPost && (
            <View style={styles.postDetailContainer}>
              <View style={styles.postDetailHeader}>
                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                  <Ionicons name='close' size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <Image
                source={selectedPost.imageUrl}
                style={styles.postDetailImage}
                cachePolicy={"memory-disk"}
              />
            </View>
          )}
        </View>
      </Modal>
    </View>
  )
}

function NoPostsFound() {
  return (
    <View style={{ height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
      <Ionicons name='images-outline' size={48} color={COLORS.primary} />
      <Text style={{ fontSize: 20, color: COLORS.white }}>No posts found</Text>
    </View>
  )
}

export default ProfileScreen  