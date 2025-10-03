// Messages Page
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatList } from '@/components/messaging/ChatList';
import { ChatWindow } from '@/components/messaging/ChatWindow';
import { NotificationCenter } from '@/components/messaging/NotificationCenter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Bell, 
  Phone, 
  Video, 
  Settings,
  ArrowLeft
} from 'lucide-react';
import { ChatRoom } from '@/services/messagingService';
import { useAuthStore } from '@/stores/authStore';

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [showMobileChat, setShowMobileChat] = useState(false);

  const { user } = useAuthStore();

  useEffect(() => {
    // Handle mobile view
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (selectedChat) {
          setShowMobileChat(true);
        }
      } else {
        setShowMobileChat(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedChat]);

  const handleChatSelect = (chatRoom: ChatRoom) => {
    setSelectedChat(chatRoom);
    if (window.innerWidth < 768) {
      setShowMobileChat(true);
    }
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    setShowMobileChat(false);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to view messages</h1>
            <p className="text-muted-foreground">
              You need to be logged in to access your conversations
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <MessageCircle className="h-8 w-8" />
            Messages
          </h1>
          <p className="text-muted-foreground">
            Communicate with clients and taskers in real-time
          </p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-12 gap-6 h-[600px]">
            {/* Chat List - 4 columns */}
            <div className="col-span-4">
              <ChatList 
                onChatSelect={handleChatSelect}
                selectedChatId={selectedChat?.id}
              />
            </div>

            {/* Chat Window - 8 columns */}
            <div className="col-span-8">
              {selectedChat ? (
                <ChatWindow 
                  taskId={selectedChat.taskId}
                  chatRoom={selectedChat}
                />
              ) : (
                <div className="h-full flex items-center justify-center border rounded-lg">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">
                      Choose a chat from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {!showMobileChat ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chats" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chats
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chats" className="mt-6">
                <ChatList 
                  onChatSelect={handleChatSelect}
                  selectedChatId={selectedChat?.id}
                />
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <NotificationCenter />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              {/* Mobile Chat Header */}
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <h2 className="font-semibold">
                    {selectedChat?.participants.tasker?.name || 
                     selectedChat?.participants.client?.name || 
                     'Unknown User'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedChat?.participants.tasker?.isOnline || 
                     selectedChat?.participants.client?.isOnline ? 
                     'Online' : 'Offline'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile Chat Window */}
              <div className="h-[500px]">
                {selectedChat && (
                  <ChatWindow 
                    taskId={selectedChat.taskId}
                    chatRoom={selectedChat}
                    onClose={handleCloseChat}
                    className="h-full"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Phone className="h-6 w-6" />
              <span>Voice Call</span>
              <span className="text-xs text-muted-foreground">
                Start a voice call
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Video className="h-6 w-6" />
              <span>Video Call</span>
              <span className="text-xs text-muted-foreground">
                Start a video call
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Settings className="h-6 w-6" />
              <span>Settings</span>
              <span className="text-xs text-muted-foreground">
                Manage notifications
              </span>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
