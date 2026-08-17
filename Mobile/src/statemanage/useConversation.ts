import { create } from 'zustand';

export interface UserType {
  _id: string;
  fullname: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
  unreadCount?: number;
  lastMessage?: MessageType;
}

export interface MessageType {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  seen: boolean;
}

interface ConversationState {
  selectedConversation: UserType | null;
  setSelectedConversation: (selectedConversation: UserType | null) => void;
  messages: MessageType[];
  setMessage: (messages: MessageType[] | ((prev: MessageType[]) => MessageType[])) => void;
  allUsers: UserType[];
  setAllUsers: (allUsers: UserType[] | ((prev: UserType[]) => UserType[])) => void;
}

const useConversation = create<ConversationState>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation: UserType | null) => set({ selectedConversation }),

  messages: [],
  setMessage: (messages: MessageType[] | ((prev: MessageType[]) => MessageType[])) =>
    set((state: ConversationState) => ({
      messages: typeof messages === 'function' ? messages(state.messages) : messages,
    })),

  allUsers: [],
  setAllUsers: (allUsers: UserType[] | ((prev: UserType[]) => UserType[])) =>
    set((state: ConversationState) => ({
      allUsers: typeof allUsers === 'function' ? allUsers(state.allUsers) : allUsers,
    })),
}));

export default useConversation;
