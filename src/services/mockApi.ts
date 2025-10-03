// Mock API service for development and testing
import { 
  User, 
  Task, 
  Category, 
  Address, 
  TaskerProfile,
  Message,
  Payment,
  Review,
  TaskSearch,
  CreateTask,
  CreateUser,
  CreateAddress,
  CreateMessage,
  ApiResponse,
  PaginatedResponse 
} from './models';

// Mock data
const mockUsers: User[] = [
  {
    id: 'user_1',
    role: 'CLIENT',
    firstName: 'Kwame',
    lastName: 'Asante',
    phone: '+233244123456',
    email: 'kwame@example.com',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'user_2',
    role: 'CLIENT',
    firstName: 'Akosua',
    lastName: 'Mensah',
    phone: '+233244234567',
    email: 'akosua@example.com',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'tasker_1',
    role: 'TASKER',
    firstName: 'Kofi',
    lastName: 'Osei',
    phone: '+233244345678',
    email: 'kofi@example.com',
    profilePhotoUrl: 'https://i.pravatar.cc/150?u=kofi',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
];

const mockTaskers: (User & { taskerProfile: TaskerProfile })[] = [
  {
    ...mockUsers[2],
    taskerProfile: {
      id: 'profile_1',
      userId: 'tasker_1',
      bio: 'Experienced house cleaner with 5+ years serving Accra homes. Eco-friendly products used.',
      skills: ['Deep Cleaning', 'Regular Cleaning', 'Office Cleaning'],
      ratingsAvg: 4.8,
      ratingsCount: 156,
      verifiedBadges: ['ID_VERIFIED', 'BACKGROUND_CHECK'],
      kycStatus: 'APPROVED',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
    }
  },
];

const mockCategories: Category[] = [
  {
    id: 'cleaning',
    name: 'House Cleaning',
    description: 'Professional home and office cleaning services',
    baseRateGHS: 80,
    pricingModel: 'HOURLY',
  },
  {
    id: 'handyman',
    name: 'Handyman',
    description: 'Home repairs and maintenance',
    baseRateGHS: 120,
    pricingModel: 'FIXED',
  },
];

const mockTasks: Task[] = [
  {
    id: 'task_1',
    clientId: 'user_1',
    categoryId: 'cleaning',
    addressId: 'addr_1',
    scheduledAt: '2024-01-20T10:00:00Z',
    durationEstMins: 180,
    status: 'CREATED',
    priceGHS: 150,
    platformFeeGHS: 15,
    currency: 'GHS',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'task_2',
    clientId: 'user_2',
    taskerId: 'tasker_1',
    categoryId: 'handyman',
    addressId: 'addr_2',
    scheduledAt: '2024-01-18T14:00:00Z',
    durationEstMins: 60,
    status: 'ASSIGNED',
    priceGHS: 80,
    platformFeeGHS: 8,
    currency: 'GHS',
    createdAt: '2024-01-16T10:30:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
  },
];

class MockApiService {
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Auth endpoints
  async requestOTP(phone: string): Promise<ApiResponse<{ message: string }>> {
    await this.delay();
    return {
      data: { message: 'OTP sent successfully' },
      success: true,
    };
  }

  async verifyOTP(phone: string, otp: string): Promise<ApiResponse<{ token: string; user: User }>> {
    await this.delay();
    if (otp === '123456') {
      const user = mockUsers[0];
      return {
        data: {
          token: 'mock-jwt-token',
          user,
        },
        success: true,
      };
    }
    return {
      data: null as any,
      success: false,
      error: 'Invalid OTP',
    };
  }

  async register(data: CreateUser): Promise<ApiResponse<{ token: string; user: User }>> {
    await this.delay();
    const user: User = {
      ...data,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.push(user);
    
    return {
      data: {
        token: 'mock-jwt-token',
        user,
      },
      success: true,
    };
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    await this.delay();
    return {
      data: mockUsers[0],
      success: true,
    };
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    await this.delay();
    const updatedUser = { ...mockUsers[0], ...updates, updatedAt: new Date().toISOString() };
    return {
      data: updatedUser,
      success: true,
    };
  }

  // Task endpoints
  async getTasks(searchParams?: TaskSearch): Promise<ApiResponse<PaginatedResponse<Task>>> {
    await this.delay();
    
    let filteredTasks = [...mockTasks];
    
    if (searchParams) {
      if (searchParams.query) {
        filteredTasks = filteredTasks.filter(task => 
          task.status.toLowerCase().includes(searchParams.query!.toLowerCase())
        );
      }
      
      if (searchParams.status) {
        filteredTasks = filteredTasks.filter(task => task.status === searchParams.status);
      }
      
      if (searchParams.categoryId) {
        filteredTasks = filteredTasks.filter(task => task.categoryId === searchParams.categoryId);
      }
    }

    const page = searchParams?.page || 1;
    const limit = searchParams?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    return {
      data: {
        data: paginatedTasks,
        total: filteredTasks.length,
        page,
        limit,
        totalPages: Math.ceil(filteredTasks.length / limit),
      },
      success: true,
    };
  }

  async createTask(taskData: CreateTask): Promise<ApiResponse<Task>> {
    await this.delay();
    
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}`,
      platformFeeGHS: taskData.priceGHS * 0.1,
      currency: 'GHS',
      status: 'CREATED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockTasks.push(newTask);
    
    return {
      data: newTask,
      success: true,
    };
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
    await this.delay();
    
    const taskIndex = mockTasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      return {
        data: null as any,
        success: false,
        error: 'Task not found',
      };
    }

    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: mockTasks[taskIndex],
      success: true,
    };
  }

  async assignTask(taskId: string, taskerId: string): Promise<ApiResponse<Task>> {
    await this.delay();
    
    const taskIndex = mockTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return {
        data: null as any,
        success: false,
        error: 'Task not found',
      };
    }

    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      taskerId,
      status: 'ASSIGNED',
      updatedAt: new Date().toISOString(),
    };

    return {
      data: mockTasks[taskIndex],
      success: true,
    };
  }

  // Category endpoints
  async getCategories(): Promise<ApiResponse<Category[]>> {
    await this.delay();
    return {
      data: mockCategories,
      success: true,
    };
  }

  // Tasker endpoints
  async searchTaskers(searchParams: any): Promise<ApiResponse<PaginatedResponse<User & { taskerProfile?: TaskerProfile }>>> {
    await this.delay();
    
    return {
      data: {
        data: mockTaskers,
        total: mockTaskers.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
      success: true,
    };
  }

  // Message endpoints
  async getMessages(taskId: string): Promise<ApiResponse<Message[]>> {
    await this.delay();
    return {
      data: [],
      success: true,
    };
  }

  async sendMessage(taskId: string, data: CreateMessage): Promise<ApiResponse<Message>> {
    await this.delay();
    
    const message: Message = {
      ...data,
      id: `msg_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    return {
      data: message,
      success: true,
    };
  }

  // Payment endpoints
  async createPayment(data: any): Promise<ApiResponse<Payment>> {
    await this.delay();
    
    const payment: Payment = {
      id: `payment_${Date.now()}`,
      taskId: data.taskId,
      userId: data.userId,
      amountGHS: data.amountGHS,
      currency: 'GHS',
      provider: 'paystack',
      providerChargeId: `ch_test_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return {
      data: payment,
      success: true,
    };
  }
}

export const mockApiService = new MockApiService();
