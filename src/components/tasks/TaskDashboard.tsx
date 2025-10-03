// Task Dashboard Component for Users
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  DollarSign,
  Users,
  MapPin,
  Calendar,
  Filter
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { taskService } from '@/services/taskService';
import { Task } from '@/services/models';
import { TaskStatus } from '@/services/models';
import { TaskList } from './TaskList';
import { TaskCreationForm } from './TaskCreationForm';
import { TaskDetail } from './TaskDetail';
import { useToast } from '@/hooks/use-toast';

interface TaskDashboardProps {
  className?: string;
}

export function TaskDashboard({ className }: TaskDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await taskService.getTaskAnalytics(user.id);
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setActiveTab('tasks');
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setSelectedTask(updatedTask);
    loadAnalytics(); // Refresh analytics
  };

  const handleTaskCreate = (taskId: string) => {
    setShowCreateForm(false);
    toast({
      title: "Task Created",
      description: "Your task has been posted successfully!",
    });
    loadAnalytics(); // Refresh analytics
  };

  const getStatusCounts = () => {
    if (!analytics) return {};
    
    return {
      active: analytics.activeTasks,
      completed: analytics.completedTasks,
      pending: analytics.pendingTasks,
      total: analytics.totalTasks,
    };
  };

  const formatCurrency = (amount: number) => `₵${amount.toFixed(2)}`;

  const getCompletionRate = () => {
    if (!analytics || analytics.totalTasks === 0) return 0;
    return Math.round((analytics.completedTasks / analytics.totalTasks) * 100);
  };

  const getStatusColor = (status: TaskStatus) => {
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

  if (!user) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
        <p className="text-muted-foreground">Please log in to access your task dashboard.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-muted-foreground">
            {user.role === 'CLIENT' 
              ? 'Manage your tasks and track their progress'
              : 'Find new tasks and manage your assignments'
            }
          </p>
        </div>
        
        {user.role === 'CLIENT' && (
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        )}
      </div>

      {/* Analytics Cards */}
      {!loading && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{analytics.totalTasks}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-bold">{analytics.activeTasks}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{analytics.completedTasks}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {user.role === 'TASKER' && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold">{formatCurrency(analytics.totalEarnings)}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {user.role === 'CLIENT' && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">{getCompletionRate()}%</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tasks completed this week</span>
                    <Badge variant="outline">5</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active assignments</span>
                    <Badge variant="outline">2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending reviews</span>
                    <Badge variant="outline">1</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Most active area</span>
                    <Badge variant="outline">East Legon</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average distance</span>
                    <Badge variant="outline">2.5 km</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Service radius</span>
                    <Badge variant="outline">10 km</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {user.role === 'CLIENT' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-2"
                      onClick={() => setShowCreateForm(true)}
                    >
                      <Plus className="h-6 w-6" />
                      <span>Create New Task</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Filter className="h-6 w-6" />
                      <span>Find Taskers</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Users className="h-6 w-6" />
                      <span>My Taskers</span>
                    </Button>
                  </>
                )}
                
                {user.role === 'TASKER' && (
                  <>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <MapPin className="h-6 w-6" />
                      <span>Find Nearby Tasks</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Clock className="h-6 w-6" />
                      <span>My Schedule</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <DollarSign className="h-6 w-6" />
                      <span>Earnings</span>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          {selectedTask ? (
            <TaskDetail
              taskId={selectedTask.id}
              onStatusUpdate={handleTaskUpdate}
              onClose={() => setSelectedTask(null)}
            />
          ) : (
            <TaskList
              userRole={user.role}
              userId={user.id}
              onTaskSelect={handleTaskSelect}
            />
          )}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Task completed</p>
                    <p className="text-xs text-muted-foreground">House cleaning in East Legon</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New task assigned</p>
                    <p className="text-xs text-muted-foreground">Garden maintenance in Osu</p>
                  </div>
                  <span className="text-xs text-muted-foreground">5 hours ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Payment received</p>
                    <p className="text-xs text-muted-foreground">₵150.00 for completed task</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Creation Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TaskCreationForm
              onSuccess={handleTaskCreate}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
