// Task List Component with Advanced Filtering
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, MapPin, Clock, DollarSign, User, AlertCircle } from 'lucide-react';
import { taskService } from '@/services/taskService';
import { Task, TaskStatus, TaskPriority } from '@/services/models';
import { categories } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface TaskListProps {
  userRole?: 'CLIENT' | 'TASKER' | 'ADMIN';
  userId?: string;
  showFilters?: boolean;
  onTaskSelect?: (task: Task) => void;
}

interface TaskFilters {
  status: string[];
  categoryId: string;
  priceRange: { min: number; max: number };
  priority: string[];
  isUrgent: boolean | null;
}

export function TaskList({ userRole = 'TASKER', userId, showFilters = true, onTaskSelect }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    categoryId: 'all',
    priceRange: { min: 0, max: 10000 },
    priority: [],
    isUrgent: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { toast } = useToast();

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = {
        filters: {
          status: filters.status.length > 0 ? filters.status : undefined,
          categoryId: filters.categoryId && filters.categoryId !== 'all' ? filters.categoryId : undefined,
          priceMin: filters.priceRange.min > 0 ? filters.priceRange.min : undefined,
          priceMax: filters.priceRange.max < 10000 ? filters.priceRange.max : undefined,
          priority: filters.priority.length > 0 ? filters.priority : undefined,
          isUrgent: filters.isUrgent,
        },
        search: searchQuery ? { query: searchQuery } : undefined,
        page: currentPage,
        limit: 10,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };

      const response = await taskService.getTasks(params);
      
      if (response.success && response.data) {
        setTasks(response.data.data);
        setTotalPages(response.data.totalPages);
      } else {
        toast({
          title: "Failed to load tasks",
          description: response.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [currentPage, filters, searchQuery]);

  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      categoryId: 'all',
      priceRange: { min: 0, max: 10000 },
      priority: [],
      isUrgent: null,
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants = {
      CREATED: 'default',
      ASSIGNED: 'secondary',
      EN_ROUTE: 'outline',
      ON_SITE: 'outline',
      IN_PROGRESS: 'outline',
      COMPLETED: 'default',
      CANCELLED: 'destructive',
      DISPUTED: 'destructive',
    };
    return variants[status] || 'default';
  };

  const getPriorityBadgeVariant = (priority: string) => {
    const variants = {
      LOW: 'secondary',
      MEDIUM: 'default',
      HIGH: 'destructive',
      URGENT: 'destructive',
    };
    return variants[priority] || 'default';
  };

  const formatLocation = (task: Task) => {
    // TODO: Implement proper location formatting from address
    return 'Accra, Ghana';
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onTaskSelect?.(task)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusBadgeVariant(task.status)}>
              {task.status.replace('_', ' ')}
            </Badge>
            {task.isUrgent && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Urgent
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Category and Priority */}
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {categories.find(cat => cat.id === task.categoryId)?.name || 'Unknown'}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(task.priority)}>
              {task.priority}
            </Badge>
          </div>

          {/* Task Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">₵{task.priceGHS.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{taskService.calculateEstimatedTime(task.durationEstMins)}</span>
            </div>
          </div>

          {/* Location and Schedule */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{formatLocation(task)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(task.scheduledAt).toLocaleDateString()} at{' '}
                {new Date(task.scheduledAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>

          {/* Client Info (for taskers) */}
          {userRole === 'TASKER' && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Posted by {task.clientId}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status.length > 0 ? filters.status[0] : 'all'}
                  onValueChange={(value) => 
                    handleFilterChange('status', value === 'all' ? [] : [value as TaskStatus])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="CREATED">Available</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) => handleFilterChange('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={filters.priority.length > 0 ? filters.priority[0] : 'all'}
                  onValueChange={(value) => 
                    handleFilterChange('priority', value === 'all' ? [] : [value as TaskPriority])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task List */}
      <div className="space-y-4">
        {loading ? (
          <LoadingSkeleton />
        ) : tasks.length > 0 ? (
          <>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground">
                {searchQuery || Object.values(filters).some(f => f !== null && f !== '' && f !== false)
                  ? 'Try adjusting your search or filters'
                  : 'No tasks are available at the moment'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
