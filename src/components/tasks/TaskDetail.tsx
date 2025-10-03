// Task Detail Component with Status Management
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Calendar, 
  Phone, 
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { taskService } from '@/services/taskService';
import { Task, TaskStatus, TaskPriority } from '@/services/models';
import { categories } from '@/data/mockData';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

interface TaskDetailProps {
  taskId: string;
  onStatusUpdate?: (task: Task) => void;
  onClose?: () => void;
}

export function TaskDetail({ taskId, onStatusUpdate, onClose }: TaskDetailProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    setLoading(true);
    try {
      const response = await taskService.getTask(taskId);
      if (response.success && response.data) {
        setTask(response.data);
      } else {
        toast({
          title: "Failed to load task",
          description: response.error || "Task not found",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading task:', error);
      toast({
        title: "Error",
        description: "Failed to load task details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (newStatus: TaskStatus) => {
    if (!task) return;

    setUpdating(true);
    try {
      const response = await taskService.updateTaskStatus(task.id, newStatus, statusNote);
      if (response.success && response.data) {
        setTask(response.data);
        setStatusNote('');
        onStatusUpdate?.(response.data);
        toast({
          title: "Status Updated",
          description: `Task status changed to ${newStatus.replace('_', ' ')}`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: response.error || "Failed to update task status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusActions = (currentStatus: string, userRole: string) => {
    const actions = [];

    switch (currentStatus) {
      case 'CREATED':
        if (userRole === 'TASKER') {
          actions.push({ status: 'ASSIGNED', label: 'Accept Task', variant: 'default' });
        }
        if (userRole === 'CLIENT') {
          actions.push({ status: 'CANCELLED', label: 'Cancel Task', variant: 'destructive' });
        }
        break;

      case 'ASSIGNED':
        actions.push({ status: 'EN_ROUTE', label: 'Start Journey', variant: 'default' });
        actions.push({ status: 'CANCELLED', label: 'Cancel', variant: 'destructive' });
        break;

      case 'EN_ROUTE':
        actions.push({ status: 'ON_SITE', label: 'Arrived on Site', variant: 'default' });
        actions.push({ status: 'CANCELLED', label: 'Cancel', variant: 'destructive' });
        break;

      case 'ON_SITE':
        actions.push({ status: 'IN_PROGRESS', label: 'Start Work', variant: 'default' });
        actions.push({ status: 'CANCELLED', label: 'Cancel', variant: 'destructive' });
        break;

      case 'IN_PROGRESS':
        actions.push({ status: 'COMPLETED', label: 'Complete Task', variant: 'default' });
        actions.push({ status: 'DISPUTED', label: 'Report Issue', variant: 'destructive' });
        break;

      case 'COMPLETED':
        // No actions for completed tasks
        break;

      case 'DISPUTED':
        actions.push({ status: 'COMPLETED', label: 'Resolve & Complete', variant: 'default' });
        actions.push({ status: 'CANCELLED', label: 'Cancel', variant: 'destructive' });
        break;

      case 'CANCELLED':
        // No actions for cancelled tasks
        break;
    }

    return actions;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      CREATED: 'bg-blue-100 text-blue-800',
      ASSIGNED: 'bg-yellow-100 text-yellow-800',
      EN_ROUTE: 'bg-purple-100 text-purple-800',
      ON_SITE: 'bg-orange-100 text-orange-800',
      IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
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

  const formatLocation = (task: Task) => {
    // TODO: Implement proper location formatting from address
    return 'Accra, Ghana';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading task details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!task) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Task Not Found</h3>
          <p className="text-muted-foreground">The requested task could not be found.</p>
        </CardContent>
      </Card>
    );
  }

  const category = categories.find(cat => cat.id === task.categoryId);
  const statusActions = getStatusActions(task.status, user?.role || '');
  const scheduledDateTime = formatDate(task.scheduledAt);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{task.title}</CardTitle>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getStatusColor(task.status)}>
                  {task.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                {task.isUrgent && (
                  <Badge variant="destructive">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Urgent
                  </Badge>
                )}
                {category && (
                  <Badge variant="outline">
                    <img src={category.icon} alt={category.name} className="w-3 h-3 mr-1" />
                    {category.name}
                  </Badge>
                )}
              </div>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground mb-6">{task.description}</p>
          
          {/* Task Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-semibold">₵{task.priceGHS.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{taskService.calculateEstimatedTime(task.durationEstMins)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="font-semibold">{scheduledDateTime.date}</p>
                <p className="text-sm text-muted-foreground">{scheduledDateTime.time}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold">{formatLocation(task)}</p>
              </div>
            </div>
          </div>

          {/* Status Actions */}
          {statusActions.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <div>
                <h4 className="font-semibold mb-3">Update Status</h4>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a note (optional)..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-3">
                    {statusActions.map((action) => (
                      <Button
                        key={action.status}
                        variant={action.variant as any}
                        onClick={() => updateTaskStatus(action.status as TaskStatus)}
                        disabled={updating}
                      >
                        {updating ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : action.status === 'COMPLETED' ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : action.status === 'CANCELLED' ? (
                          <XCircle className="h-4 w-4 mr-2" />
                        ) : null}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Task Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">Task Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(task.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            {task.status !== 'CREATED' && (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Task Assigned</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(task.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            
            {(task.status === 'COMPLETED' || task.status === 'CANCELLED') && (
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  task.status === 'COMPLETED' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className="font-medium">
                    {task.status === 'COMPLETED' ? 'Task Completed' : 'Task Cancelled'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(task.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-semibold">{task.clientId}</p>
              </div>
            </div>
            
            {task.taskerId && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Tasker</p>
                  <p className="font-semibold">{task.taskerId}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-semibold">+233 XX XXX XXXX</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Chat</p>
                <Button variant="outline" size="sm">
                  Open Chat
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
