// Task Service - Business logic for task management
import { apiService, API_ENDPOINTS } from './api';
import { 
  Task, 
  CreateTask, 
  UpdateTask,
  TaskSearch,
  ApiResponse,
  PaginatedResponse,
  TaskStatus,
  TaskPriority
} from './models';

export class TaskService {
  // Get all tasks with pagination and filtering
  async getTasks(searchParams?: TaskSearch): Promise<ApiResponse<PaginatedResponse<Task>>> {
    const params = new URLSearchParams();
    
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `${API_ENDPOINTS.TASKS.LIST}${params.toString() ? `?${params.toString()}` : ''}`;
    return apiService.get<PaginatedResponse<Task>>(endpoint);
  }

  // Get available tasks (status: CREATED)
  async getAvailableTasks(searchParams?: TaskSearch): Promise<ApiResponse<PaginatedResponse<Task>>> {
    const params = { ...searchParams, status: 'CREATED' };
    return this.getTasks(params);
  }

  // Get task by ID
  async getTask(id: string): Promise<ApiResponse<Task>> {
    return apiService.get<Task>(API_ENDPOINTS.TASKS.GET(id));
  }

  // Create new task
  async createTask(taskData: CreateTask): Promise<ApiResponse<Task>> {
    // Calculate platform fee (10% of task price)
    const platformFee = taskData.priceGHS * 0.1;
    
    const taskWithFee = {
      ...taskData,
      platformFeeGHS: platformFee,
      currency: 'GHS',
    };

    return apiService.post<Task>(API_ENDPOINTS.TASKS.CREATE, taskWithFee);
  }

  // Update task
  async updateTask(id: string, updates: UpdateTask): Promise<ApiResponse<Task>> {
    return apiService.put<Task>(API_ENDPOINTS.TASKS.UPDATE(id), updates);
  }

  // Delete task
  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(API_ENDPOINTS.TASKS.DELETE(id));
  }

  // Assign task to tasker
  async assignTask(taskId: string, taskerId: string): Promise<ApiResponse<Task>> {
    return apiService.post<Task>(API_ENDPOINTS.TASKS.ASSIGN(taskId), { taskerId });
  }

  // Update task status
  async updateTaskStatus(
    taskId: string, 
    status: Task['status'], 
    note?: string
  ): Promise<ApiResponse<Task>> {
    return apiService.put<Task>(API_ENDPOINTS.TASKS.UPDATE_STATUS(taskId), { 
      status, 
      note 
    });
  }

  // Get tasks by user (client or tasker)
  async getTasksByUser(
    userId: string, 
    role: 'CLIENT' | 'TASKER',
    searchParams?: Partial<TaskSearch>
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    const params: TaskSearch = { 
      ...searchParams,
      page: searchParams?.page || 1,
      limit: searchParams?.limit || 20
    } as TaskSearch;
    
    if (role === 'CLIENT') {
      (params as any).clientId = userId;
    } else {
      (params as any).taskerId = userId;
    }

    return this.getTasks(params);
  }

  // Get tasks by status
  async getTasksByStatus(
    status: Task['status'],
    searchParams?: TaskSearch
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    const params = { ...searchParams, status };
    return this.getTasks(params);
  }

  // Search tasks
  async searchTasks(query: string, filters?: Omit<TaskSearch, 'query'>): Promise<ApiResponse<PaginatedResponse<Task>>> {
    const searchParams: TaskSearch = {
      ...filters,
      query,
    };
    return this.getTasks(searchParams);
  }

  // Get nearby tasks (for taskers)
  async getNearbyTasks(
    location: string,
    radius?: number,
    searchParams?: TaskSearch
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    const params = { 
      ...searchParams, 
      location,
      radius: radius?.toString(),
    };
    return this.getTasks(params);
  }

  // Calculate estimated completion time
  calculateEstimatedTime(durationEstMins: number): string {
    const hours = Math.floor(durationEstMins / 60);
    const minutes = durationEstMins % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  // Calculate total cost including platform fee
  calculateTotalCost(priceGHS: number): { total: number; fee: number; breakdown: string } {
    const fee = priceGHS * 0.1;
    const total = priceGHS + fee;
    
    return {
      total,
      fee,
      breakdown: `Task: ₵${priceGHS} + Platform Fee: ₵${fee.toFixed(2)} = Total: ₵${total.toFixed(2)}`,
    };
  }

  // Validate task creation
  validateTaskCreation(taskData: CreateTask): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!taskData.title) errors.push('Task title is required');
    if (!taskData.description) errors.push('Task description is required');
    if (!taskData.categoryId) errors.push('Category is required');
    if (!taskData.addressId) errors.push('Address is required');
    if (!taskData.scheduledAt) errors.push('Scheduled time is required');
    if (!taskData.durationEstMins) errors.push('Duration is required');
    if (!taskData.priceGHS) errors.push('Price is required');

    // Validate price
    if (taskData.priceGHS && taskData.priceGHS < 10) {
      errors.push('Minimum price is ₵10');
    }

    // Validate duration
    if (taskData.durationEstMins && taskData.durationEstMins < 15) {
      errors.push('Minimum duration is 15 minutes');
    }

    // Validate scheduled time (must be in future)
    if (taskData.scheduledAt) {
      const scheduledDate = new Date(taskData.scheduledAt);
      const now = new Date();
      if (scheduledDate <= now) {
        errors.push('Scheduled time must be in the future');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get task status display info
  getTaskStatusInfo(status: Task['status']) {
    const statusMap = {
      CREATED: { 
        label: 'Available', 
        color: 'blue', 
        description: 'Task is available for assignment',
        nextActions: ['ASSIGN']
      },
      ASSIGNED: { 
        label: 'Assigned', 
        color: 'yellow', 
        description: 'Task has been assigned to a tasker',
        nextActions: ['EN_ROUTE', 'CANCELLED']
      },
      EN_ROUTE: { 
        label: 'En Route', 
        color: 'orange', 
        description: 'Tasker is on the way',
        nextActions: ['ON_SITE', 'CANCELLED']
      },
      ON_SITE: { 
        label: 'On Site', 
        color: 'purple', 
        description: 'Tasker has arrived at the location',
        nextActions: ['IN_PROGRESS', 'CANCELLED']
      },
      IN_PROGRESS: { 
        label: 'In Progress', 
        color: 'indigo', 
        description: 'Task is being completed',
        nextActions: ['COMPLETED', 'DISPUTED']
      },
      COMPLETED: { 
        label: 'Completed', 
        color: 'green', 
        description: 'Task has been completed successfully',
        nextActions: []
      },
      DISPUTED: { 
        label: 'Disputed', 
        color: 'red', 
        description: 'Task has been disputed',
        nextActions: ['COMPLETED', 'CANCELLED']
      },
      CANCELLED: { 
        label: 'Cancelled', 
        color: 'gray', 
        description: 'Task has been cancelled',
        nextActions: []
      },
    };

    return statusMap[status] || statusMap.CREATED;
  }

  // Get task analytics
  async getTaskAnalytics(userId?: string, dateRange?: { start: string; end: string }): Promise<ApiResponse<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    totalEarnings: number;
    averageRating: number;
    taskBreakdown: Record<string, number>;
    dailyStats: Array<{
      date: string;
      tasks: number;
      earnings: number;
    }>;
  }>> {
    const queryParams = new URLSearchParams();
    if (userId) queryParams.append('userId', userId);
    if (dateRange?.start) queryParams.append('startDate', dateRange.start);
    if (dateRange?.end) queryParams.append('endDate', dateRange.end);
    
    const endpoint = `${API_ENDPOINTS.TASKS.LIST}/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get(endpoint);
  }
}

// Export singleton instance
export const taskService = new TaskService();
