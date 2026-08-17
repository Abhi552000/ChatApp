import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import io, { Socket } from 'socket.io-client';
import useConversation, { MessageType, UserType } from '../statemanage/useConversation';
import { Vibration } from 'react-native';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { authUser } = useAuth();

  useEffect(() => {
    if (authUser && authUser.user && authUser.user.isVerified) {
      // Connect to Mac local network server
      const socketUrl = 'http://Abhisheks-MacBook-Air.local:5002';
      
      const newSocket = io(socketUrl, {
        query: {
          userId: authUser.user._id,
        },
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('[Socket] Connected. ID:', newSocket.id);
      });

      newSocket.on('connect_error', (error: any) => {
        console.warn('[Socket] Connection error:', error);
      });

      newSocket.on('getOnlineUsers', (users: string[]) => {
        setOnlineUsers(users);
      });

      // Handle new message events globally
      newSocket.on('newMessage', (newMessage: MessageType) => {
        console.log('[Socket] Received message:', newMessage);

        // Native Vibration Alert
        Vibration.vibrate(80);

        const { selectedConversation, setMessage, setAllUsers } = useConversation.getState();
        const isSenderActive =
          selectedConversation &&
          String(selectedConversation._id) === String(newMessage.senderId);

        if (isSenderActive) {
          // Add to current conversation messages list
          setMessage((prev: MessageType[]) => [...prev, newMessage]);
          // Emit read status back to sender
          newSocket.emit('messageSeen', { senderId: newMessage.senderId });
        }

        // Update last message & unread count in contact list
        setAllUsers((prevUsers: UserType[]) => {
          if (!Array.isArray(prevUsers)) return [];
          return prevUsers.map((u) => {
            if (String(u._id) === String(newMessage.senderId)) {
              return {
                ...u,
                lastMessage: newMessage,
                unreadCount: isSenderActive ? 0 : (u.unreadCount || 0) + 1,
              };
            }
            return u;
          });
        });
      });

      // Handle read status updates globally
      newSocket.on('messageSeen', ({ senderId }: { senderId: string }) => {
        console.log('[Socket] Received seen notification for:', senderId);
        
        const { setMessage, setAllUsers } = useConversation.getState();

        // Mark our sent messages as seen
        setMessage((prev: MessageType[]) => {
          if (!Array.isArray(prev)) return [];
          return prev.map((msg) =>
            String(msg.senderId) !== String(senderId) ? { ...msg, seen: true } : msg
          );
        });

        // Update seen checkmark in sidebar/user list
        setAllUsers((prevUsers: UserType[]) => {
          if (!Array.isArray(prevUsers)) return [];
          return prevUsers.map((u) => {
            if (
              String(u._id) === String(senderId) &&
              u.lastMessage &&
              String(u.lastMessage.senderId) !== String(senderId)
            ) {
              return {
                ...u,
                lastMessage: { ...u.lastMessage, seen: true },
              };
            }
            return u;
          });
        });
      });

      return () => {
        newSocket.close();
        setSocket(null);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
