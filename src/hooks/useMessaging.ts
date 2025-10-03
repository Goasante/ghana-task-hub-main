// Messaging Hook for Real-time Communication
import { useState, useEffect, useCallback } from 'react';
import { messagingService, Message, ChatRoom, Notification, TypingIndicator } from '@/services/messagingService';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

interface UseMessagingOptions {
  taskId?: string;
  autoConnect?: boolean;
}

interface UseMessagingReturn {
  // Connection
  isConnected: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => void;

  // Messages
  messages: Message[];
  loadingMessages: boolean;
  sendMessage: (content: string, type?: Message['type'], metadata?: Message['metadata']) => Promise<boolean>;
  loadMessages: (params?: any) => Promise<void>;

  // Chat Rooms
  chatRooms: ChatRoom[];
  loadingChatRooms: boolean;
  loadChatRooms: (params?: any) => Promise<void>;
  joinChatRoom: (taskId: string) => Promise<boolean>;
  leaveChatRoom: (taskId: string) => Promise<boolean>;

  // Notifications
  notifications: Notification[];
  loadingNotifications: boolean;
  unreadCount: number;
  loadNotifications: (params?: any) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<boolean>;
  markAllNotificationsAsRead: () => Promise<boolean>;

  // Typing Indicators
  typingIndicator: TypingIndicator | null;
  sendTypingIndicator: (isTyping: boolean) => void;

  // Real-time Events
  onMessage: (handler: (message: Message) => void) => () => void;
  onNotification: (handler: (notification: Notification) => void) => () => void;
  onTypingIndicator: (handler: (indicator: TypingIndicator) => void) => () => void;

  // Utility Functions
  formatMessageTime: (timestamp: string) => string;
  formatMessagePreview: (content: string, maxLength?: number) => string;
  getMessageTypeIcon: (type: Message['type']) => string;
  getNotificationIcon: (type: Notification['type']) => string;

  // Error Handling
  error: string | null;
  clearError: () => void;
}

export function useMessaging(options: UseMessagingOptions = {}): UseMessagingReturn {
  const { taskId, autoConnect = true } = options;
  const { user } = useAuthStore();
  const { toast } = useToast();

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [typingIndicator, setTypingIndicator] = useState<TypingIndicator | null>(null);
  
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingChatRooms, setLoadingChatRooms] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Connection management
  const connect = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const connected = await messagingService.connect(user.id, 'mock_token');
      setIsConnected(connected);
      
      if (connected) {
        toast({
          title: "Connected",
          description: "Real-time messaging is now active",
        });
      } else {
        throw new Error('Failed to connect to messaging service');
      }
      
      return connected;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMessage);
      setIsConnected(false);
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  }, [user, toast]);

  const disconnect = useCallback(() => {
    messagingService.disconnect();
    setIsConnected(false);
  }, []);

  // Message management
  const loadMessages = useCallback(async (params?: any) => {
    if (!taskId) return;

    setLoadingMessages(true);
    setError(null);
    
    try {
      const response = await messagingService.getMessages(taskId, params);
      if (response.success && response.data) {
        setMessages(Array.isArray(response.data) ? response.data : response.data.data);
      } else {
        throw new Error(response.error || 'Failed to load messages');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingMessages(false);
    }
  }, [taskId, toast]);

  const sendMessage = useCallback(async (
    content: string, 
    type: Message['type'] = 'TEXT',
    metadata?: Message['metadata']
  ): Promise<boolean> => {
    if (!taskId || !user || !content.trim()) return false;

    try {
      // Find the chat room to get receiver ID
      const chatRoom = chatRooms.find(room => room.taskId === taskId);
      if (!chatRoom) {
        throw new Error('Chat room not found');
      }

      const receiverId = user.id === chatRoom.clientId 
        ? chatRoom.taskerId || '' 
        : chatRoom.clientId;

      const response = await messagingService.sendMessage({
        taskId,
        receiverId,
        content: content.trim(),
        type,
        metadata,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to send message');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      toast({
        title: "Send Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [taskId, user, chatRooms, toast]);

  // Chat room management
  const loadChatRooms = useCallback(async (params?: any) => {
    setLoadingChatRooms(true);
    setError(null);
    
    try {
      const response = await messagingService.getChatRooms(params);
      if (response.success && response.data) {
        setChatRooms(Array.isArray(response.data) ? response.data : response.data.data);
      } else {
        throw new Error(response.error || 'Failed to load chat rooms');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chat rooms';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingChatRooms(false);
    }
  }, [toast]);

  const joinChatRoom = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      const joined = await messagingService.joinChatRoom(taskId);
      return joined;
    } catch (error) {
      console.error('Error joining chat room:', error);
      return false;
    }
  }, []);

  const leaveChatRoom = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      const left = await messagingService.leaveChatRoom(taskId);
      return left;
    } catch (error) {
      console.error('Error leaving chat room:', error);
      return false;
    }
  }, []);

  // Notification management
  const loadNotifications = useCallback(async (params?: any) => {
    setLoadingNotifications(true);
    setError(null);
    
    try {
      const response = await messagingService.getNotifications(params);
      if (response.success && response.data) {
        setNotifications(Array.isArray(response.data) ? response.data : response.data.data);
      } else {
        throw new Error(response.error || 'Failed to load notifications');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingNotifications(false);
    }
  }, [toast]);

  const markNotificationAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const response = await messagingService.markNotificationAsRead(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const response = await messagingService.markAllNotificationsAsRead();
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }, []);

  // Typing indicators
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (taskId) {
      messagingService.sendTypingIndicator(taskId, isTyping);
    }
  }, [taskId]);

  // Real-time event handlers
  const onMessage = useCallback((handler: (message: Message) => void) => {
    if (!taskId) return () => {};

    const unsubscribe = messagingService.onMessage(taskId, (message) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(msg => msg.id === message.id)) return prev;
        return [...prev, message];
      });
      handler(message);
    });

    return unsubscribe;
  }, [taskId]);

  const onNotification = useCallback((handler: (notification: Notification) => void) => {
    const unsubscribe = messagingService.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev]);
      handler(notification);
    });

    return unsubscribe;
  }, []);

  const onTypingIndicator = useCallback((handler: (indicator: TypingIndicator) => void) => {
    if (!taskId) return () => {};

    const unsubscribe = messagingService.onTypingIndicator(taskId, (indicator) => {
      setTypingIndicator(indicator.isTyping ? indicator : null);
      handler(indicator);
    });

    return unsubscribe;
  }, [taskId]);

  // Utility functions
  const formatMessageTime = useCallback((timestamp: string) => {
    return messagingService.formatMessageTime(timestamp);
  }, []);

  const formatMessagePreview = useCallback((content: string, maxLength: number = 50) => {
    return messagingService.formatMessagePreview(content, maxLength);
  }, []);

  const getMessageTypeIcon = useCallback((type: Message['type']) => {
    return messagingService.getMessageTypeIcon(type);
  }, []);

  const getNotificationIcon = useCallback((type: Notification['type']) => {
    return messagingService.getNotificationIcon(type);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-connect and setup
  useEffect(() => {
    if (autoConnect && user) {
      connect();
    }
  }, [autoConnect, user, connect]);

  // Set up real-time listeners
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeConnection = messagingService.onConnectionChange(setIsConnected);
    const unsubscribeNotification = onNotification(() => {}); // Just for setup

    return () => {
      unsubscribeConnection();
      unsubscribeNotification();
    };
  }, [isConnected, onNotification]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (taskId) {
        leaveChatRoom(taskId);
      }
    };
  }, [taskId, leaveChatRoom]);

  return {
    // Connection
    isConnected,
    connect,
    disconnect,

    // Messages
    messages,
    loadingMessages,
    sendMessage,
    loadMessages,

    // Chat Rooms
    chatRooms,
    loadingChatRooms,
    loadChatRooms,
    joinChatRoom,
    leaveChatRoom,

    // Notifications
    notifications,
    loadingNotifications,
    unreadCount,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,

    // Typing Indicators
    typingIndicator,
    sendTypingIndicator,

    // Real-time Events
    onMessage,
    onNotification,
    onTypingIndicator,

    // Utility Functions
    formatMessageTime,
    formatMessagePreview,
    getMessageTypeIcon,
    getNotificationIcon,

    // Error Handling
    error,
    clearError,
  };
}
