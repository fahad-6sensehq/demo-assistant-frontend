import { clearToken, getToken } from './auth-storage';
import type {
  AdminChatSummary,
  AdminUser,
  AdminUserChat,
  AuthResponse,
  ChatHistory,
  SendMessageResponse,
  User,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
    }

    let message = 'Request failed';
    try {
      const data = (await response.json()) as { message?: string | string[] };
      message = Array.isArray(data.message)
        ? data.message.join(', ')
        : (data.message ?? message);
    } catch {
      message = response.statusText || message;
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  register(data: { name: string; email: string; password: string }) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login(data: { email: string; password: string }) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  me() {
    return request<User>('/auth/me');
  },

  getChatHistory() {
    return request<ChatHistory>('/chat');
  },

  sendMessage(content: string) {
    return request<SendMessageResponse>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  adminListUsers() {
    return request<AdminUser[]>('/admin/users');
  },

  adminListChats() {
    return request<AdminChatSummary[]>('/admin/chats');
  },

  adminGetUserChat(userId: string) {
    return request<AdminUserChat>(`/admin/users/${userId}/chat`);
  },
};

export { ApiError };
