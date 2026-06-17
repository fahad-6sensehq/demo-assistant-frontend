import { clearToken, getToken } from './auth-storage';
import type {
  AdminChatSummary,
  AdminUser,
  AdminUserChat,
  AuthResponse,
  ChatHistory,
  SendMessageResponse,
  User,
  UserFile,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function resolveId(item: { id?: string; _id?: string }, fallback: string) {
  return item.id ?? item._id ?? fallback;
}

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

  if (
    !headers.has('Content-Type') &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
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
    return request<(AdminUser & { _id?: string })[]>('/admin/users').then(
      (users) =>
        users.map((user) => ({
          ...user,
          id: resolveId(user, user.email),
        })),
    );
  },

  adminListChats() {
    return request<(AdminChatSummary & { user?: { _id?: string } | null })[]>(
      '/admin/chats',
    ).then((chats) =>
      chats.map((chat) => ({
        ...chat,
        user: chat.user
          ? {
              ...chat.user,
              id: resolveId(chat.user, chat.user.email),
            }
          : null,
      })),
    );
  },

  adminGetUserChat(userId: string) {
    return request<AdminUserChat>(`/admin/users/${userId}/chat`);
  },

  listEmbeddingFiles() {
    return request<UserFile[]>('/embeddings/files');
  },

  uploadEmbeddingFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return request<UserFile>('/embeddings/files', {
      method: 'POST',
      body: formData,
    });
  },

  deleteEmbeddingFile(fileId: string) {
    return request<void>(`/embeddings/files/${fileId}`, {
      method: 'DELETE',
    });
  },
};

export { ApiError };
