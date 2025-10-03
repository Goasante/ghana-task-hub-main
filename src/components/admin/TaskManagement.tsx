// Task Management Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Loader2,
  Users,
  Calendar,
  XCircle
} from 'lucide-react';
import { adminService, AdminTask } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';

interface TaskManagementProps {
  className?: string;
}

export function TaskManagement({ className }: TaskManagementProps) {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<AdminTask | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await adminService.getTasks({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
        limit: 50,
      });
      
      if (response.success && response.data) {
        setTasks(response.data.data || response.data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = async (taskId: string, action: string, data?: any) => {
    setActionLoading(taskId);
    try {
      let response;
      
      switch (action) {
        case 'assign':
          response = await adminService.assignTaskToTasker(taskId, data.taskerId);
          break;
        case 'cancel':
          response = await adminService.cancelTask(taskId, data.reason);
          break;
        case 'status':
          response = await adminService.updateTaskStatus(taskId, data.status, data.reason);
          break;
        default:
          throw new Error('Unknown action');
      }

      if (response.success) {
        toast({
          title: "Success",
          description: `Task ${action} completed successfully`,
        });
        await loadTasks();
        setShowTaskDetails(false);
        setShowAssignDialog(false);
        setShowCancelDialog(false);
        setCancelReason('');
      } else {
        throw new Error(response.error || 'Action failed');
      }
    } catch (error) {
      console.error(`Error performing task ${action}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} task`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants = {
      CREATED: 'secondary',
      ASSIGNED: 'default',
      EN_ROUTE: 'default',
      ON_SITE: 'default',
      IN_PROGRESS: 'default',
      COMPLETED: 'default',
      CANCELLED: 'destructive',
      DISPUTED: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const getPriorityBadgeVariant = (priority: string) => {
    const variants = {
      LOW: 'secondary',
      MEDIUM: 'default',
      HIGH: 'destructive',
      URGENT: 'destructive',
    };
    return variants[priority] || 'secondary';
  };

  const formatDate = (date: string) => {
    return adminService.formatDate(date);
  };

  const formatCurrency = (amount: number) => {
    return adminService.formatCurrency(amount);
  };

  const TaskRow = ({ task }: { task: AdminTask }) => {
    const isActionLoading = actionLoading === task.id;

    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-muted rounded-lg">
            <ClipboardList className="h-6 w-6" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{task.title}</h3>
              <Badge variant={getStatusBadgeVariant(task.status)}>
                {task.status}
              </Badge>
              <Badge variant={getPriorityBadgeVariant(task.priority)}>
                {task.priority}
              </Badge>
              {task.isUrgent && (
                <Badge variant="destructive">Urgent</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {task.client.firstName} {task.client.lastName}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {task.address.city}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(task.scheduledAt)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(task.priceGHS)}
              </span>
              <span className="text-sm text-muted-foreground">
                Fee: {formatCurrency(task.platformFeeGHS)}
              </span>
              {task.tasker && (
                <span className="text-sm text-blue-600">
                  Assigned to: {task.tasker.firstName} {task.tasker.lastName}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedTask(task);
              setShowTaskDetails(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>

          {task.status === 'CREATED' && !task.tasker && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTask(task);
                setShowAssignDialog(true);
              }}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          )}

          {(task.status === 'DISPUTED' || task.status === 'CANCELLED') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTask(task);
                setShowCancelDialog(true);
              }}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}

          {isActionLoading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Task Management
          </h2>
          <p className="text-muted-foreground">
            Monitor and manage all platform tasks
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="CREATED">Created</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="EN_ROUTE">En Route</SelectItem>
                <SelectItem value="ON_SITE">On Site</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="DISPUTED">Disputed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="home-repairs">Home Repairs</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tasks ({tasks.length})</span>
            <Button variant="outline" size="sm" onClick={loadTasks}>
              <Filter className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'No tasks have been created yet'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Details Dialog */}
      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-6">
              {/* Task Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{selectedTask.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getStatusBadgeVariant(selectedTask.status)}>
                      {selectedTask.status}
                    </Badge>
                    <Badge variant={getPriorityBadgeVariant(selectedTask.priority)}>
                      {selectedTask.priority}
                    </Badge>
                    {selectedTask.isUrgent && (
                      <Badge variant="destructive">Urgent</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedTask.priceGHS)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Platform fee: {formatCurrency(selectedTask.platformFeeGHS)}
                  </p>
                </div>
              </div>

              {/* Task Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedTask.description}</p>
              </div>

              {/* Task Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Client</h4>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {selectedTask.client.firstName.charAt(0)}{selectedTask.client.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {selectedTask.client.firstName} {selectedTask.client.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedTask.client.phone}</p>
                    </div>
                  </div>
                </div>

                {selectedTask.tasker && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Tasker</h4>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {selectedTask.tasker.firstName.charAt(0)}{selectedTask.tasker.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {selectedTask.tasker.firstName} {selectedTask.tasker.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{selectedTask.tasker.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-semibold">Location</h4>
                  <p className="text-sm text-muted-foreground">{selectedTask.address.fullAddress}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedTask.address.city}, {selectedTask.address.region}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Scheduled</h4>
                  <p className="text-sm">{formatDate(selectedTask.scheduledAt)}</p>
                  {selectedTask.completedAt && (
                    <p className="text-xs text-green-600">
                      Completed: {formatDate(selectedTask.completedAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              {selectedTask.payment && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Payment</h4>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Status: {selectedTask.payment.status}</p>
                      <p className="text-sm text-muted-foreground">
                        Amount: {formatCurrency(selectedTask.payment.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Platform Fee: {formatCurrency(selectedTask.payment.platformFee)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedTask.status === 'CREATED' && !selectedTask.tasker && (
                  <Button
                    onClick={() => {
                      setShowTaskDetails(false);
                      setShowAssignDialog(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Tasker
                  </Button>
                )}
                
                {selectedTask.status === 'DISPUTED' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTaskDetails(false);
                      setShowCancelDialog(true);
                    }}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Resolve Dispute
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowTaskDetails(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Tasker Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Tasker</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="tasker-select">Select Tasker</Label>
              <Select>
                <SelectTrigger id="tasker-select">
                  <SelectValue placeholder="Choose a tasker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tasker1">John Doe (Rating: 4.8)</SelectItem>
                  <SelectItem value="tasker2">Jane Smith (Rating: 4.9)</SelectItem>
                  <SelectItem value="tasker3">Mike Johnson (Rating: 4.7)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will automatically notify the selected tasker about the assignment.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAssignDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleTaskAction(selectedTask!.id, 'assign', { taskerId: 'tasker1' })}
                disabled={actionLoading === selectedTask?.id}
                className="flex-1"
              >
                {actionLoading === selectedTask?.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Assigning...
                  </>
                ) : (
                  'Assign Tasker'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Task Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Task</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancel-reason">Cancellation Reason</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Provide a reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action will cancel the task and notify both the client and tasker.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleTaskAction(selectedTask!.id, 'cancel', { reason: cancelReason })}
                disabled={!cancelReason.trim() || actionLoading === selectedTask?.id}
                className="flex-1"
              >
                {actionLoading === selectedTask?.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Task'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
