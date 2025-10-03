// Chat List Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Search, 
  Plus, 
  Clock, 
  Check,
  CheckCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { messagingService, ChatRoom } from '@/services/messagingService';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

interface ChatListProps {
  onChatSelect: (chatRoom: ChatRoom) => void;
  selectedChatId?: string;
  className?: string;
}

export function ChatList({ onChatSelect, selectedChatId, className }: ChatListProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Connect to messaging service
    messagingService.connect(user.id, 'mock_token');
    
    // Load chat rooms
    loadChatRooms();
    
    // Set up connection listener
    const unsubscribeConnection = messagingService.onConnectionChange(handleConnectionChange);

    return () => {
      unsubscribeConnection();
    };
  }, [user]);

  const loadChatRooms = async () => {
    setLoading(true);
    try {
      const response = await messagingService.getChatRooms({ limit: 50 });
      if (response.success && response.data) {
        setChatRooms(Array.isArray(response.data) ? response.data : response.data.data);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
  };

  const handleChatSelect = (chatRoom: ChatRoom) => {
    onChatSelect(chatRoom);
  };

  const formatMessageTime = (timestamp: string) => {
    return messagingService.formatMessageTime(timestamp);
  };

  const formatMessagePreview = (content: string) => {
    return messagingService.formatMessagePreview(content, 40);
  };

  const getOtherParticipant = (chatRoom: ChatRoom) => {
    return user?.id === chatRoom.clientId 
      ? chatRoom.participants.tasker 
      : chatRoom.participants.client;
  };

  const getMessageStatusIcon = (message: ChatRoom['lastMessage'], isOwnMessage: boolean) => {
    if (!message || !isOwnMessage) return null;

    // This would be determined by message delivery status in a real implementation
    return <CheckCheck className="h-3 w-3 text-blue-500" />;
  };

  const filteredChatRooms = chatRooms.filter(chatRoom => {
    if (!searchQuery) return true;
    
    const otherParticipant = getOtherParticipant(chatRoom);
    const searchLower = searchQuery.toLowerCase();
    
    return (
      otherParticipant?.name?.toLowerCase().includes(searchLower) ||
      chatRoom.lastMessage?.content.toLowerCase().includes(searchLower) ||
      chatRoom.taskId.toLowerCase().includes(searchLower)
    );
  });

  const ChatRoomItem = ({ chatRoom }: { chatRoom: ChatRoom }) => {
    const otherParticipant = getOtherParticipant(chatRoom);
    const isSelected = selectedChatId === chatRoom.id;
    const isOwnMessage = chatRoom.lastMessage?.senderId === user?.id;

    return (
      <div
        className={`
          flex items-center space-x-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors
          ${isSelected ? 'bg-muted border-r-2 border-primary' : ''}
        `}
        onClick={() => handleChatSelect(chatRoom)}
      >
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarImage src={otherParticipant?.avatar} />
            <AvatarFallback>
              {otherParticipant?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {otherParticipant?.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-sm truncate">
              {otherParticipant?.name || 'Unknown User'}
            </h3>
            <div className="flex items-center gap-2">
              {chatRoom.lastMessage && (
                <span className="text-xs text-muted-foreground">
                  {formatMessageTime(chatRoom.lastMessage.createdAt)}
                </span>
              )}
              {chatRoom.unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {chatRoom.unreadCount > 9 ? '9+' : chatRoom.unreadCount}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {chatRoom.lastMessage ? (
                <>
                  {getMessageStatusIcon(chatRoom.lastMessage, isOwnMessage)}
                  <p className="text-sm text-muted-foreground truncate">
                    {isOwnMessage && 'You: '}
                    {formatMessagePreview(chatRoom.lastMessage.content)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No messages yet
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              Task #{chatRoom.taskId.slice(-6)}
            </span>
            {chatRoom.isActive ? (
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Completed
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} title={isConnected ? 'Connected' : 'Disconnected'} />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading conversations...</span>
            </div>
          ) : filteredChatRooms.length === 0 ? (
            <div className="text-center py-8">
              {searchQuery ? (
                <>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No conversations found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms
                  </p>
                </>
              ) : (
                <>
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start a conversation by accepting a task or creating one
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Tasks
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div>
              {filteredChatRooms.map((chatRoom) => (
                <ChatRoomItem key={chatRoom.id} chatRoom={chatRoom} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
