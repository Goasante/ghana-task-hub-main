// Messaging Service for Ghana Task Hub
import { apiService, API_ENDPOINTS, ApiResponse, PaginatedResponse } from './api';

export interface Message {
  id: string;
  taskId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'LOCATION';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    imageUrl?: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  id: string;
  taskId: string;
  clientId: string;
  taskerId?: string;
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  participants: {
    client: {
      id: string;
      name: string;
      avatar?: string;
      isOnline: boolean;
    };
    tasker?: {
      id: string;
      name: string;
      avatar?: string;
      isOnline: boolean;
    };
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'MESSAGE' | 'TASK_UPDATE' | 'PAYMENT' | 'SYSTEM' | 'ASSIGNMENT';
  title: string;
  message: string;
  data?: {
    taskId?: string;
    messageId?: string;
    paymentId?: string;
    [key: string]: any;
  };
  isRead: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
}

export interface TypingIndicator {
  taskId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: number;
}

export interface MessageDeliveryStatus {
  messageId: string;
  status: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  timestamp: string;
  error?: string;
}

export class MessagingService {
  private socket: any = null;
  private messageHandlers: Map<string, (message: Message) => void> = new Map();
  private notificationHandlers: Map<string, (notification: Notification) => void> = new Map();
  private typingHandlers: Map<string, (indicator: TypingIndicator) => void> = new Map();
  private connectionHandlers: Map<string, (isConnected: boolean) => void> = new Map();
  private isConnected: boolean = false;

  // Socket.IO connection management
  async connect(userId: string, token: string): Promise<boolean> {
    try {
      // For development, we'll simulate socket connection
      // In production, this would connect to your Socket.IO server
      this.socket = {
        connected: true,
        emit: (event: string, data: any) => {
          console.log('Socket emit:', event, data);
          // Simulate real-time responses
          this.simulateRealTimeResponse(event, data);
        },
        on: (event: string, callback: Function) => {
          console.log('Socket listener added:', event);
        },
        disconnect: () => {
          this.isConnected = false;
          this.notifyConnectionHandlers(false);
        }
      };

      this.isConnected = true;
      this.notifyConnectionHandlers(true);
      
      // Join user-specific room
      this.joinRoom(`user:${userId}`);
      
      return true;
    } catch (error) {
      console.error('Socket connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.notifyConnectionHandlers(false);
  }

  // Message management
  async sendMessage(messageData: {
    taskId: string;
    receiverId: string;
    content: string;
    type?: Message['type'];
    metadata?: Message['metadata'];
  }): Promise<ApiResponse<Message>> {
    try {
      const response = await apiService.post<Message>(
        `${API_ENDPOINTS.MESSAGES.SEND(messageData.taskId)}`,
        messageData
      );

      if (response.success && response.data && this.socket) {
        // Emit real-time message
        this.socket.emit('message:send', {
          taskId: messageData.taskId,
          message: response.data,
        });
      }

      return response;
    } catch (error) {
      return {
        data: null as Message,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  async getMessages(taskId: string, params?: {
    page?: number;
    limit?: number;
    before?: string; // message ID to get messages before this
  }): Promise<ApiResponse<PaginatedResponse<Message>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.before) queryParams.append('before', params.before);

    const endpoint = `${API_ENDPOINTS.MESSAGES.LIST(taskId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<PaginatedResponse<Message>>(endpoint);
  }

  async markMessageAsRead(messageId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiService.patch<void>(
        `/messages/${messageId}/read`,
        {}
      );

      if (response.success && this.socket) {
        // Emit read receipt
        this.socket.emit('message:read', { messageId });
      }

      return response;
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark message as read',
      };
    }
  }

  async deleteMessage(messageId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiService.delete<void>(`/messages/${messageId}`);

      if (response.success && this.socket) {
        // Emit message deletion
        this.socket.emit('message:delete', { messageId });
      }

      return response;
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete message',
      };
    }
  }

  // Chat room management
  async getChatRooms(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<ChatRoom>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const endpoint = `/chat-rooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<PaginatedResponse<ChatRoom>>(endpoint);
  }

  async getChatRoom(taskId: string): Promise<ApiResponse<ChatRoom>> {
    return apiService.get<ChatRoom>(`/chat-rooms/task/${taskId}`);
  }

  async joinChatRoom(taskId: string): Promise<boolean> {
    if (this.socket) {
      this.socket.emit('room:join', { taskId });
      this.joinRoom(`task:${taskId}`);
      return true;
    }
    return false;
  }

  async leaveChatRoom(taskId: string): Promise<boolean> {
    if (this.socket) {
      this.socket.emit('room:leave', { taskId });
      this.leaveRoom(`task:${taskId}`);
      return true;
    }
    return false;
  }

  // Typing indicators
  sendTypingIndicator(taskId: string, isTyping: boolean): void {
    if (this.socket && isTyping) {
      this.socket.emit('typing:start', { taskId });
    } else if (this.socket && !isTyping) {
      this.socket.emit('typing:stop', { taskId });
    }
  }

  // Notifications
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: Notification['type'];
    isRead?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<Notification>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());

    const endpoint = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<PaginatedResponse<Notification>>(endpoint);
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return apiService.patch<void>(`/notifications/${notificationId}/read`, {});
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return apiService.patch<void>('/notifications/read-all', {});
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/notifications/${notificationId}`);
  }

  // Event handlers
  onMessage(taskId: string, handler: (message: Message) => void): () => void {
    const key = `message:${taskId}`;
    this.messageHandlers.set(key, handler);
    
    return () => {
      this.messageHandlers.delete(key);
    };
  }

  onNotification(handler: (notification: Notification) => void): () => void {
    const key = 'notification';
    this.notificationHandlers.set(key, handler);
    
    return () => {
      this.notificationHandlers.delete(key);
    };
  }

  onTypingIndicator(taskId: string, handler: (indicator: TypingIndicator) => void): () => void {
    const key = `typing:${taskId}`;
    this.typingHandlers.set(key, handler);
    
    return () => {
      this.typingHandlers.delete(key);
    };
  }

  onConnectionChange(handler: (isConnected: boolean) => void): () => void {
    const key = 'connection';
    this.connectionHandlers.set(key, handler);
    
    // Immediately call with current state
    handler(this.isConnected);
    
    return () => {
      this.connectionHandlers.delete(key);
    };
  }

  // Utility methods
  private joinRoom(room: string): void {
    if (this.socket) {
      this.socket.emit('room:join', { room });
    }
  }

  private leaveRoom(room: string): void {
    if (this.socket) {
      this.socket.emit('room:leave', { room });
    }
  }

  private notifyMessageHandlers(taskId: string, message: Message): void {
    const key = `message:${taskId}`;
    const handler = this.messageHandlers.get(key);
    if (handler) {
      handler(message);
    }
  }

  private notifyNotificationHandlers(notification: Notification): void {
    const key = 'notification';
    const handler = this.notificationHandlers.get(key);
    if (handler) {
      handler(notification);
    }
  }

  private notifyTypingHandlers(taskId: string, indicator: TypingIndicator): void {
    const key = `typing:${taskId}`;
    const handler = this.typingHandlers.get(key);
    if (handler) {
      handler(indicator);
    }
  }

  private notifyConnectionHandlers(isConnected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      handler(isConnected);
    });
  }

  // Simulate real-time responses for development
  private simulateRealTimeResponse(event: string, data: any): void {
    setTimeout(() => {
      switch (event) {
        case 'message:send':
          // Simulate message delivery
          const mockMessage: Message = {
            id: `msg_${Date.now()}`,
            taskId: data.taskId,
            senderId: 'current_user',
            receiverId: data.message.receiverId,
            content: data.message.content,
            type: data.message.type || 'TEXT',
            isRead: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.notifyMessageHandlers(data.taskId, mockMessage);
          break;

        case 'typing:start':
          // Simulate typing indicator
          const typingIndicator: TypingIndicator = {
            taskId: data.taskId,
            userId: 'other_user',
            userName: 'Other User',
            isTyping: true,
            timestamp: Date.now(),
          };
          this.notifyTypingHandlers(data.taskId, typingIndicator);
          break;

        case 'typing:stop':
          // Stop typing indicator
          const stopTyping: TypingIndicator = {
            taskId: data.taskId,
            userId: 'other_user',
            userName: 'Other User',
            isTyping: false,
            timestamp: Date.now(),
          };
          this.notifyTypingHandlers(data.taskId, stopTyping);
          break;
      }
    }, 500); // Simulate network delay
  }

  // Message formatting utilities
  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  }

  formatMessagePreview(content: string, maxLength: number = 50): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  getMessageTypeIcon(type: Message['type']): string {
    const icons = {
      TEXT: '💬',
      IMAGE: '🖼️',
      FILE: '📎',
      SYSTEM: '⚙️',
      LOCATION: '📍',
    };
    return icons[type] || '💬';
  }

  getNotificationIcon(type: Notification['type']): string {
    const icons = {
      MESSAGE: '💬',
      TASK_UPDATE: '📋',
      PAYMENT: '💰',
      SYSTEM: '⚙️',
      ASSIGNMENT: '👤',
    };
    return icons[type] || '🔔';
  }

  getPriorityColor(priority: Notification['priority']): string {
    const colors = {
      LOW: 'text-gray-600',
      MEDIUM: 'text-blue-600',
      HIGH: 'text-orange-600',
      URGENT: 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  }

  // Connection status
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected;
  }

  // Cleanup
  cleanup(): void {
    this.disconnect();
    this.messageHandlers.clear();
    this.notificationHandlers.clear();
    this.typingHandlers.clear();
    this.connectionHandlers.clear();
  }
}

// Export singleton instance
export const messagingService = new MessagingService();
