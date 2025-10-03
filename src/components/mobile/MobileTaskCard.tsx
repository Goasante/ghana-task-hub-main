// Mobile-Optimized Task Card Component
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Task } from '@/stores/taskStore';
import { cn } from '@/lib/utils';

interface MobileTaskCardProps {
  task: Task;
  onClick?: () => void;
  className?: string;
}

export function MobileTaskCard({ task, onClick, className }: MobileTaskCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      CREATED: 'bg-blue-100 text-blue-800',
      ASSIGNED: 'bg-yellow-100 text-yellow-800',
      EN_ROUTE: 'bg-purple-100 text-purple-800',
      ON_SITE: 'bg-orange-100 text-orange-800',
      IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      DISPUTED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-3 w-3" />;
      case 'DISPUTED':
      case 'CANCELLED':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <Card 
      className={cn(
        "w-full cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight mb-1 line-clamp-2">
              {task.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-1 ml-2">
            <Badge className={cn("text-xs", getStatusColor(task.status))}>
              {getStatusIcon(task.status)}
              <span className="ml-1">{task.status}</span>
            </Badge>
            {task.priority && (
              <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
                {task.priority}
              </Badge>
            )}
            {task.isUrgent && (
              <Badge variant="destructive" className="text-xs">
                Urgent
              </Badge>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={task.client?.profilePhotoUrl} />
            <AvatarFallback className="text-xs">
              {task.client?.firstName?.[0]}{task.client?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {task.client?.firstName} {task.client?.lastName}
            </p>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="text-xs text-muted-foreground">4.8</span>
            </div>
          </div>
        </div>

        {/* Task Details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{task.address?.fullAddress || 'Location not specified'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{formatDate(task.scheduledAt)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-600">
              ₵{task.priceGHS?.toFixed(2)}
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Posted {formatDate(task.createdAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
