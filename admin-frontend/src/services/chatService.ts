import axios from "../shared/axios";

export interface Citation {
  source: string;
  page: number;
  content: string;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  content: string;
  role: "user" | "assistant";
  created_at: string;
  citations?: Citation[];
}

export interface Chat {
  id: number;
  user_id: number;
  created_at: string;
  messages: ChatMessage[];
}

export interface BackendChatHistory {
  id: string;
  messages: Array<{
    query: string;
    answer: string;
    citations: any[];
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

const chatService = {
  // Create a new chat session
  createChat: async (): Promise<number> => {
    const response = await axios.post("/chat/new");
    return response.data.id;
  },

  // Send a message to a chat session
  sendMessage: async (
    chatId: number,
    message: string,
    collection_name?: string
  ) => {
    const response = await axios.post(`/chat/${chatId}/message`, {
      message,
      collection_name,
    });
    return response.data;
  },

  // Get chat history for a specific chat
  getChatHistory: async (chatId: number): Promise<BackendChatHistory> => {
    const response = await axios.get(`/chat/history/${chatId}`);
    return response.data;
  },

  // Get all chats (for sidebar)
  fetchAllChats: async (): Promise<Chat[]> => {
    const response = await axios.get("/chat/all");
    return response.data;
  },

  // Delete a chat session
  deleteChat: async (chatId: string) => {
    await axios.delete(`/chat/${chatId}`);
  },

  // Update chat title
  updateChatTitle: async (chatId: string, title: string) => {
    await axios.patch(`/chat/${chatId}/title`, { title });
  },
};

export default chatService;
