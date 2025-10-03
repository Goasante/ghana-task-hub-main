// Notification Center Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Trash2, 
  MessageCircle, 
  CreditCard, 
  FileText, 
  Settings,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { messagingService, Notification } from '@/services/messagingService';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Connect to messaging service
    messagingService.connect(user.id, 'mock_token');
    
    // Load notifications
    loadNotifications();
    
    // Set up notification listener
    const unsubscribeNotification = messagingService.onNotification(handleNewNotification);

    return () => {
      unsubscribeNotification();
    };
  }, [user]);

  useEffect(() => {
    // Update unread count
    const unread = notifications.filter(n => !n.isRead).length;
    setUnreadCount(unread);
  }, [notifications]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await messagingService.getNotifications({ limit: 50 });
      if (response.success && response.data) {
        setNotifications(Array.isArray(response.data) ? response.data : response.data.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingAsRead(notificationId);
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
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    setDeleting(notificationId);
    try {
      const response = await messagingService.deleteNotification(notificationId);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        toast({
          title: "Notification Deleted",
          description: "Notification has been removed",
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await messagingService.markAllNotificationsAsRead();
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        toast({
          title: "All Notifications Read",
          description: "All notifications have been marked as read",
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const formatNotificationTime = (timestamp: string) => {
    return messagingService.formatMessageTime(timestamp);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icon = messagingService.getNotificationIcon(type);
    const iconMap = {
      MESSAGE: MessageCircle,
      TASK_UPDATE: FileText,
      PAYMENT: CreditCard,
      SYSTEM: Settings,
      ASSIGNMENT: AlertTriangle,
    };
    
    const IconComponent = iconMap[type] || Bell;
    return <IconComponent className="h-5 w-5" />;
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    const colors = {
      LOW: 'text-gray-600',
      MEDIUM: 'text-blue-600',
      HIGH: 'text-orange-600',
      URGENT: 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  const getPriorityBadgeVariant = (priority: Notification['priority']): "default" | "destructive" | "outline" | "secondary" | "success" => {
    const variants = {
      LOW: 'secondary' as const,
      MEDIUM: 'default' as const,
      HIGH: 'destructive' as const,
      URGENT: 'destructive' as const,
    };
    return variants[priority] || 'secondary';
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    return (
      <div className={`
        flex items-start space-x-3 p-4 border-b hover:bg-muted/50 transition-colors
        ${!notification.isRead ? 'bg-blue-50/50' : ''}
      `}>
        <div className={`
          p-2 rounded-full
          ${!notification.isRead ? 'bg-blue-100' : 'bg-muted'}
        `}>
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <h4 className={`font-medium text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                {notification.title}
              </h4>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <Badge 
                variant={getPriorityBadgeVariant(notification.priority)} 
                className="text-xs"
              >
                {notification.priority}
              </Badge>
            </div>
          </div>

          <p className={`text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
            {notification.message}
          </p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatNotificationTime(notification.createdAt)}
            </span>
            
            <div className="flex items-center gap-1">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(notification.id)}
                  disabled={markingAsRead === notification.id}
                >
                  {markingAsRead === notification.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteNotification(notification.id)}
                disabled={deleting === notification.id}
              >
                {deleting === notification.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
            <Button variant="outline" size="sm">
              <BellOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                You'll receive notifications for messages, task updates, and more
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
