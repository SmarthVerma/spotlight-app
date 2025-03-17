import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import Loader from '@/components/Loader';
import { styles } from '@/styles/profile.styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { ScrollView } from 'react-native-gesture-handler';
import { Image } from "expo-image";

const ProfileScreen = () => {
  const { signOut, userId } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const currentUser = useQuery(api.users.getUserByClerkId, userId ? { clerkId: userId } : 'skip')

  const [editatedProfile, setEditatedProfile] = useState({
    fullname: currentUser?.fullName || "",
    bio: currentUser?.bio || "",
  })

  const [setselectedPost, setSetselectedPost] = useState<Doc<"posts"> | null>(null)
  const posts = useQuery(api.posts.getPostsByUser)

  const handleSaveProfile = () => { }

  if (!currentUser || posts === undefined) return <Loader />


  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>{currentUser.username}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity>
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
            <TouchableOpacity style={styles.editButton} >
              <Text style={styles.editButtonText}>
                Edit Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} >
              <Ionicons name='share-outline' size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default ProfileScreen  