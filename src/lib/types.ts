export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export interface ChatHistory {
  conversationId: string;
  messages: ChatMessage[];
}

export interface SendMessageResponse {
  reply: ChatMessage;
  messages: ChatMessage[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface AdminChatSummary {
  conversationId: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  messageCount: number;
  lastMessage: {
    role: string;
    content: string;
    createdAt: string;
  } | null;
  updatedAt: string;
}

export interface AdminUserChat {
  user: {
    id: string;
    name: string;
    email: string;
  };
  conversationId: string;
  messages: ChatMessage[];
}
