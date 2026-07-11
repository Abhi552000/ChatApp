import { create } from "zustand";

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),

  messages: [],

  // FIX: allow array OR function updater
  setMessage: (messages) =>
    set((state) => ({
      messages:
        typeof messages === "function"
          ? messages(state.messages)
          : messages,
    })),

  allUsers: [],
  setAllUsers: (allUsers) =>
    set((state) => ({
      allUsers:
        typeof allUsers === "function"
          ? allUsers(state.allUsers)
          : allUsers,
    })),
}));

export default useConversation;