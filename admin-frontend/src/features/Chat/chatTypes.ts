export interface ChatSession {
  id: string;
  title?: string;
  preview?: string;
  created_at: string;
  updated_at: string;
}

export interface Citation {
  filename: string;
  source: string;
  page: number;
  content: string;
  file_type?: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: string;
  citations?: Citation[];
}
