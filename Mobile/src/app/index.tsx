import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import useConversation, { UserType } from '../statemanage/useConversation';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/png?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/png?seed=Garfield',
  'https://api.dicebear.com/7.x/lorelei/png?seed=Nala',
  'https://api.dicebear.com/7.x/fun-emoji/png?seed=Buster',
  'https://api.dicebear.com/7.x/personas/png?seed=Caleb',
];

export default function HomeScreen() {
  const { authUser, setAuthUser, logout } = useAuth();
  const { onlineUsers } = useSocketContext();
  const { allUsers, setAllUsers, setSelectedConversation } = useConversation();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Edit profile states
  const [editName, setEditName] = useState('');
  const [editAbout, setEditAbout] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  const currentUser = authUser?.user || { fullname: '', email: '', about: '', avatar: '' };

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/user/allusers');
        setAllUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const openProfileModal = () => {
    setEditName(currentUser.fullname);
    setEditAbout(currentUser.about || 'Hey there! I am using Messenger.');
    setEditAvatar(currentUser.avatar || '');
    setSaveError('');
    setIsProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setSaveError('Name cannot be empty');
      return;
    }

    setSaveLoading(true);
    setSaveError('');

    try {
      const response = await axios.put('/api/user/update', {
        fullname: editName.trim(),
        about: editAbout.trim(),
        avatar: editAvatar.trim(),
      });

      if (response.data && response.data.user) {
        const updatedAuth = { ...authUser!, user: response.data.user };
        await setAuthUser(updatedAuth);
        setIsProfileOpen(false);
      }
    } catch (error: any) {
      if (error.response) {
        setSaveError(error.response.data.error || 'Failed to update profile');
      } else {
        setSaveError('Network error. Check your server.');
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUserSelect = (user: UserType) => {
    setSelectedConversation(user);
    // Reset unread count for this user locally
    setAllUsers((prevUsers) => {
      if (!Array.isArray(prevUsers)) return [];
      return prevUsers.map((u) =>
        String(u._id) === String(user._id) ? { ...u, unreadCount: 0 } : u
      );
    });
    // Navigate to Chat detail room
    router.push(`/chat/${user._id}` as any);
  };

  const filteredUsers = allUsers.filter((user) =>
    user.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserItem = ({ item }: { item: UserType }) => {
    const isOnline = onlineUsers.includes(item._id);

    // Format last message time
    let lastMsgTime = '';
    if (item.lastMessage) {
      const date = new Date(item.lastMessage.createdAt);
      lastMsgTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Get preview text
    let lastMsgText = item.email; // fallback
    if (item.lastMessage) {
      const isMe = String(item.lastMessage.senderId) !== String(item._id);
      const prefix = isMe ? 'You: ' : '';
      const text = item.lastMessage.message;
      lastMsgText = `${prefix}${text.length > 25 ? text.substring(0, 22) + '...' : text}`;
    }

    return (
      <TouchableOpacity
        onPress={() => handleUserSelect(item)}
        activeOpacity={0.7}
        style={styles.userItem}
      >
        {/* Avatar Area with Online Dot */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarFrame}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{getInitials(item.fullname)}</Text>
            )}
          </View>
          {isOnline && <View style={styles.onlineBadge} />}
        </View>

        {/* Content Area */}
        <View style={styles.userContent}>
          <View style={styles.userMeta}>
            <Text style={styles.userName}>{item.fullname}</Text>
            <Text style={styles.userTime}>{lastMsgTime}</Text>
          </View>
          <View style={styles.userSub}>
            <Text style={styles.userMessage} numberOfLines={1}>
              {lastMsgText}
            </Text>
            {item.unreadCount && item.unreadCount > 0 ? (
              <View style={styles.unreadCountBadge}>
                <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Custom Header Area */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={openProfileModal}
            style={styles.myAvatarBtn}
            activeOpacity={0.8}
          >
            {currentUser.avatar ? (
              <Image source={{ uri: currentUser.avatar }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.myAvatarText}>{getInitials(currentUser.fullname)}</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chats</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={openProfileModal} style={styles.actionBtn}>
            <Ionicons name="settings-outline" size={22} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => logout()} style={styles.actionBtn}>
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Area */}
      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color="#4B5563" />
          <TextInput
            placeholder="Search users..."
            placeholderTextColor="#4B5563"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#4B5563" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Users List Area */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No chats available</Text>
            </View>
          }
        />
      )}

      {/* Profile Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isProfileOpen}
        onRequestClose={() => setIsProfileOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.profileCard}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.profileTitle}>Profile Settings</Text>
              <TouchableOpacity onPress={() => setIsProfileOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={{ width: '100%' }}
              contentContainerStyle={styles.modalScrollContent} 
              showsVerticalScrollIndicator={false}
            >
              
              {saveError ? (
                <View style={styles.modalErrorBanner}>
                  <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  <Text style={styles.modalErrorText}>{saveError}</Text>
                </View>
              ) : null}

              {/* Avatar Section */}
              <View style={styles.profileAvatarSection}>
                <View style={styles.profileAvatarFrame}>
                  {editAvatar ? (
                    <Image source={{ uri: editAvatar }} style={styles.profileAvatarImg} />
                  ) : (
                    <Text style={styles.profileAvatarText}>{getInitials(editName || currentUser.fullname)}</Text>
                  )}
                </View>

                {/* Preset List */}
                <Text style={styles.presetsLabel}>CHOOSE AN AVATAR PRESET</Text>
                <View style={styles.presetsRowContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
                    {PRESET_AVATARS.map((url, idx) => {
                      const isSelected = editAvatar === url;
                      return (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => setEditAvatar(url)}
                          activeOpacity={0.8}
                          style={[styles.presetFrame, isSelected && styles.presetFrameSelected]}
                        >
                          <Image source={{ uri: url }} style={styles.presetImg} />
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Custom URL Input */}
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>CUSTOM AVATAR IMAGE URL (OPTIONAL)</Text>
                  <TextInput
                    value={editAvatar}
                    onChangeText={setEditAvatar}
                    placeholder="https://example.com/avatar.jpg"
                    placeholderTextColor="#4B5563"
                    style={styles.modalInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.divider} />

              {/* Fields Section */}
              <View style={styles.modalFieldsSection}>
                {/* Email (Read Only) */}
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>EMAIL ADDRESS (PERMANENT)</Text>
                  <TextInput
                    value={currentUser.email}
                    editable={false}
                    style={[styles.modalInput, styles.modalInputDisabled]}
                  />
                </View>

                {/* Name */}
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>DISPLAY NAME</Text>
                  <TextInput
                    value={editName}
                    onChangeText={(txt) => {
                      setEditName(txt);
                      setSaveError('');
                    }}
                    placeholder="Your name"
                    placeholderTextColor="#4B5563"
                    style={styles.modalInput}
                  />
                </View>

                {/* About / Status */}
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>STATUS / ABOUT</Text>
                  <TextInput
                    value={editAbout}
                    onChangeText={(txt) => {
                      setEditAbout(txt);
                      setSaveError('');
                    }}
                    placeholder="Hey there! I am using Chatterbox."
                    placeholderTextColor="#4B5563"
                    style={styles.modalInput}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  disabled={saveLoading}
                  activeOpacity={0.8}
                  style={styles.saveProfileBtn}
                >
                  {saveLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveProfileBtnText}>Save Profile</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={async () => {
                    await logout();
                    setIsProfileOpen(false);
                  }}
                  activeOpacity={0.8}
                  style={styles.modalLogoutBtn}
                >
                  <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
                  <Text style={styles.modalLogoutBtnText}>Log Out</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#161B26',
    backgroundColor: '#0F172A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  myAvatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#161B26',
    overflow: 'hidden',
  },
  myAvatarText: {
    color: '#F3F4F6',
    fontSize: 13,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F3F4F6',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    borderRadius: 20,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#161B26',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: '#F3F4F6',
    fontSize: 15,
    marginLeft: 8,
  },
  listContainer: {
    paddingVertical: 8,
  },
  separator: {
    height: 0.5,
    backgroundColor: '#1E293B',
    marginLeft: 78,
    marginRight: 16,
  },
  userItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatarFrame: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#161B26',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarText: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: '700',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#090D16',
  },
  userContent: {
    flex: 1,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F3F4F6',
  },
  userTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  userSub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  userMessage: {
    fontSize: 13,
    color: '#9CA3AF',
    flex: 1,
    marginRight: 8,
  },
  unreadCountBadge: {
    backgroundColor: '#10B981',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  profileCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#161B26',
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
    modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#161B26',
    paddingBottom: 10,
  },
  modalCloseBtn: {
    padding: 4,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F3F4F6',
  },
  modalScrollContent: {
    width: '100%',
    alignItems: 'stretch',
    paddingBottom: 20,
  },
  modalErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    width: '100%',
    gap: 8,
  },
  modalErrorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  profileAvatarSection: {
    alignItems: 'center',
    width: '100%',
  },
  profileAvatarFrame: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563EB',
    marginBottom: 16,
    overflow: 'hidden',
  },
  profileAvatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileAvatarText: {
    color: '#F3F4F6',
    fontSize: 24,
    fontWeight: '700',
  },
  presetsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  presetsRowContainer: {
    width: '100%',
    height: 52,
    marginVertical: 10,
  },
  presetsRow: {
    gap: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  presetFrame: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  presetFrameSelected: {
    borderColor: '#2563EB',
    transform: [{ scale: 1.05 }],
  },
  presetImg: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#161B26',
    width: '100%',
    marginVertical: 16,
  },
  modalFieldsSection: {
    width: '100%',
  },
  modalInputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#161B26',
    borderRadius: 12,
    color: '#F3F4F6',
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  modalInputDisabled: {
    opacity: 0.5,
    color: '#6B7280',
  },
  modalActions: {
    width: '100%',
    marginTop: 8,
    gap: 10,
  },
  saveProfileBtn: {
    backgroundColor: '#2563EB',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  saveProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalLogoutBtn: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#161B26',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  modalLogoutBtnText: {
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '700',
  },
});
