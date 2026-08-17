import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';
import useConversation, { MessageType } from '../../statemanage/useConversation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { authUser } = useAuth();
  const { socket, onlineUsers } = useSocketContext();
  const { selectedConversation, setSelectedConversation, messages, setMessage, setAllUsers } = useConversation();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<any>(null);

  const currentUserId = authUser?.user?._id;
  const isOnline = selectedConversation ? onlineUsers.includes(selectedConversation._id) : false;

  // Load chat messages on mount/change
  useEffect(() => {
    const fetchMessages = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await axios.get(`/api/message/get/${id}`);
        setMessage(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Mark messages as seen initially
    if (socket && id) {
      socket.emit('messageSeen', { senderId: id });
    }
  }, [id, socket]);

  // Handle read receipt & typing socket listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for partner typing
    socket.on('typing', () => {
      setPartnerTyping(true);
    });

    socket.on('stopTyping', () => {
      setPartnerTyping(false);
    });

    return () => {
      socket.off('typing');
      socket.off('stopTyping');
      setSelectedConversation(null);
    };
  }, [socket]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!typingText.trim() || !id) return;

    const messageContent = typingText.trim();
    setTypingText('');

    if (socket) {
      socket.emit('stopTyping', id);
    }

    try {
      const response = await axios.post(`/api/message/send/${id}`, {
        message: messageContent,
      });

      const newMessage = response.data;
      setMessage((prev) => [...prev, newMessage]);

      // Update lastMessage inside contact list in Zustand
      setAllUsers((prevUsers) => {
        if (!prevUsers) return [];
        return prevUsers.map((u) =>
          String(u._id) === String(id) ? { ...u, lastMessage: newMessage } : u
        );
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTextChange = (text: string) => {
    setTypingText(text);

    if (!socket || !id) return;

    // Emit typing status
    socket.emit('typing', id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', id);
    }, 1200);
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

  const formatLastSeen = (lastSeenDate?: string) => {
    if (!lastSeenDate) return 'Offline';

    const date = new Date(lastSeenDate);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const timeString = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (date.toDateString() === today.toDateString()) {
      return `Last seen today at ${timeString}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Last seen yesterday at ${timeString}`;
    } else {
      return `Last seen on ${date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      })}`;
    }
  };

  const renderMessageItem = ({ item }: { item: MessageType }) => {
    const isMe = item.senderId === currentUserId;
    const date = new Date(item.createdAt);
    const formattedTime = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowPartner]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubblePartner]}>
          <Text style={styles.messageText}>{item.message}</Text>
          <View style={styles.msgFooter}>
            <Text style={styles.msgTime}>{formattedTime}</Text>
            {isMe && (
              <Text style={[styles.seenCheck, item.seen && styles.seenCheckTrue]}>
                {item.seen ? '✓✓' : '✓'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!selectedConversation) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#F3F4F6" />
        </TouchableOpacity>

        <View style={styles.avatarWrapper}>
          <View style={styles.avatarFrame}>
            {selectedConversation.avatar ? (
              <Image source={{ uri: selectedConversation.avatar }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{getInitials(selectedConversation.fullname)}</Text>
            )}
          </View>
          {isOnline && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.headerDetails}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {selectedConversation.fullname}
          </Text>
          {partnerTyping ? (
            <Text style={styles.typingIndicator}>typing...</Text>
          ) : (
            <Text style={styles.headerSubtitle}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          )}
        </View>
      </View>

      {/* Messages List Area */}
      {loading ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Message Typing & Send Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputArea}>
          <TextInput
            placeholder="Type message..."
            placeholderTextColor="#9CA3AF"
            style={styles.textInput}
            value={typingText}
            onChangeText={handleTextChange}
            multiline
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!typingText.trim()}
            style={[styles.sendBtn, !typingText.trim() && styles.sendBtnDisabled]}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#161B26',
    backgroundColor: '#0F172A',
  },
  backBtn: {
    marginRight: 8,
    padding: 4,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatarFrame: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111827',
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
    fontSize: 14,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#090D16',
  },
  headerDetails: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F3F4F6',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  typingIndicator: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  loadingArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 4,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowPartner: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 80,
  },
  bubbleMe: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  bubblePartner: {
    backgroundColor: '#1F2937',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    lineHeight: 20,
  },
  msgFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  msgTime: {
    fontSize: 9.5,
    color: 'rgba(243, 244, 246, 0.65)',
  },
  seenCheck: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  seenCheckTrue: {
    color: '#60A5FA',
    fontWeight: '800',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderColor: '#161B26',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#161B26',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    color: '#F3F4F6',
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#090D16',
  },
});
