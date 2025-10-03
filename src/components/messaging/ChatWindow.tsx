// Chat Window Component
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Image, 
  MapPin, 
  Phone,
  Video,
  MoreVertical,
  Smile,
  Loader2
} from 'lucide-react';
import { messagingService, Message, ChatRoom, TypingIndicator } from '@/services/messagingService';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

interface ChatWindowProps {
  taskId: string;
  chatRoom?: ChatRoom;
  onClose?: () => void;
  className?: string;
}

export function ChatWindow({ taskId, chatRoom, onClose, className }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState<TypingIndicator | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Connect to messaging service
    messagingService.connect(user.id, 'mock_token');
    
    // Join chat room
    messagingService.joinChatRoom(taskId);
    
    // Load initial messages
    loadMessages();
    
    // Set up real-time listeners
    const unsubscribeMessage = messagingService.onMessage(taskId, handleNewMessage);
    const unsubscribeTyping = messagingService.onTypingIndicator(taskId, handleTypingIndicator);
    const unsubscribeConnection = messagingService.onConnectionChange(handleConnectionChange);

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeConnection();
      messagingService.leaveChatRoom(taskId);
    };
  }, [taskId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingIndicator]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await messagingService.getMessages(taskId, { limit: 50 });
      if (response.success && response.data) {
        setMessages(Array.isArray(response.data) ? response.data : response.data.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message: Message) => {
    setMessages(prev => {
      // Avoid duplicates
      if (prev.some(msg => msg.id === message.id)) return prev;
      return [...prev, message];
    });
  };

  const handleTypingIndicator = (indicator: TypingIndicator) => {
    setTypingIndicator(indicator.isTyping ? indicator : null);
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatRoom || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const receiverId = user?.id === chatRoom.clientId 
        ? chatRoom.taskerId || '' 
        : chatRoom.clientId;

      const response = await messagingService.sendMessage({
        taskId,
        receiverId,
        content: messageContent,
        type: 'TEXT',
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to send message');
      }

      // Stop typing indicator
      messagingService.sendTypingIndicator(taskId, false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      // Restore message content
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    if (value.trim()) {
      messagingService.sendTypingIndicator(taskId, true);
    } else {
      messagingService.sendTypingIndicator(taskId, false);
    }

    // Stop typing indicator after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      messagingService.sendTypingIndicator(taskId, false);
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    return messagingService.formatMessageTime(timestamp);
  };

  const getMessageTypeIcon = (type: Message['type']) => {
    return messagingService.getMessageTypeIcon(type);
  };

  const isOwnMessage = (message: Message) => {
    return message.senderId === user?.id;
  };

  const getParticipantInfo = () => {
    if (!chatRoom) return null;
    
    const otherParticipant = user?.id === chatRoom.clientId 
      ? chatRoom.participants.tasker 
      : chatRoom.participants.client;

    return otherParticipant;
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isOwn = isOwnMessage(message);
    
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {!isOwn && (
            <Avatar className="w-8 h-8">
              <AvatarImage src={getParticipantInfo()?.avatar} />
              <AvatarFallback>
                {getParticipantInfo()?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
            <div className={`
              px-4 py-2 rounded-lg
              ${isOwn 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm">{getMessageTypeIcon(message.type)}</span>
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
            <p className={`text-xs text-muted-foreground mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
              {formatMessageTime(message.createdAt)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const TypingIndicatorBubble = () => {
    if (!typingIndicator) return null;

    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-end space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback>
              {typingIndicator.userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-1">
              <span className="text-sm">{typingIndicator.userName} is typing</span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ConnectionStatus = () => {
    if (isConnected) return null;

    return (
      <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <span className="text-sm text-yellow-800">Connecting...</span>
        </div>
      </div>
    );
  };

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={getParticipantInfo()?.avatar} />
              <AvatarFallback>
                {getParticipantInfo()?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {getParticipantInfo()?.name || 'Unknown User'}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  getParticipantInfo()?.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm text-muted-foreground">
                  {getParticipantInfo()?.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <ConnectionStatus />
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Start the conversation by sending a message
              </p>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <TypingIndicatorBubble />
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="flex-shrink-0 border-t p-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Image className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
                className="pr-12"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              size="sm"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
