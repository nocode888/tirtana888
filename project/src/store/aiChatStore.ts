import create from 'zustand';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

export const useAIChatStore = create<AIChatState>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  clearMessages: () => set({ messages: [] }),
}));