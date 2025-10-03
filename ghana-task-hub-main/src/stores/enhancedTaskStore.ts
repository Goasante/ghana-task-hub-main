import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  EnhancedTask, 
  TaskStatus, 
  EnhancedUser, 
  Category, 
  Address, 
  TaskEvent,
  TaskMessage,
  Payment
} from '@/types/enhanced';

interface EnhancedTaskState {
  // Data
  tasks: EnhancedTask[];
  currentTask: EnhancedTask | null;
  users: EnhancedUser[];
  categories: Category[];
  
  // Actions
  addTask: (task: Omit<EnhancedTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<EnhancedTask>) => void;
  updateTaskStatus: (id: string, status: TaskStatus, note?: string) => void;
  assignTask: (taskId: string, taskerId: string) => void;
  setCurrentTask: (task: EnhancedTask | null) => void;
  
  // Task lifecycle management
  getTasksByStatus: (status: TaskStatus) => EnhancedTask[];
  getTasksByUser: (userId: string, role: 'CLIENT' | 'TASKER') => EnhancedTask[];
  getAvailableTasks: () => EnhancedTask[];
  
  // Task events and messaging
  addTaskEvent: (taskId: string, type: string, payload?: any) => void;
  addTaskMessage: (taskId: string, senderId: string, messageText: string) => void;
  
  // Payment integration
  createPayment: (taskId: string, userId: string, amountGHS: number) => void;
  updatePaymentStatus: (taskId: string, status: 'pending' | 'successful' | 'failed') => void;
}

// Enhanced mock data with production-ready structure
const mockUsers: EnhancedUser[] = [
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
  {
    id: 'tasker_2',
    role: 'TASKER',
    firstName: 'Ama',
    lastName: 'Adjei',
    phone: '+233244456789',
    email: 'ama@example.com',
    profilePhotoUrl: 'https://i.pravatar.cc/150?u=ama',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    taskerProfile: {
      id: 'profile_2',
      userId: 'tasker_2',
      bio: 'Certified electrician and plumber. Quick response for emergency repairs.',
      skills: ['Electrical', 'Plumbing', 'Appliance Repair'],
      ratingsAvg: 4.9,
      ratingsCount: 89,
      verifiedBadges: ['ID_VERIFIED', 'SKILL_CERTIFIED'],
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
    subServices: [
      { id: 'sub_1', name: 'Deep Cleaning', description: 'Thorough cleaning of entire home', categoryId: 'cleaning' },
      { id: 'sub_2', name: 'Regular Cleaning', description: 'Weekly or bi-weekly maintenance', categoryId: 'cleaning' },
      { id: 'sub_3', name: 'Office Cleaning', description: 'Commercial cleaning services', categoryId: 'cleaning' },
    ]
  },
  {
    id: 'handyman',
    name: 'Handyman',
    description: 'Home repairs and maintenance',
    baseRateGHS: 120,
    pricingModel: 'FIXED',
    subServices: [
      { id: 'sub_4', name: 'Plumbing', description: 'Pipe repairs and installations', categoryId: 'handyman' },
      { id: 'sub_5', name: 'Electrical', description: 'Electrical repairs and installations', categoryId: 'handyman' },
      { id: 'sub_6', name: 'Carpentry', description: 'Wood work and repairs', categoryId: 'handyman' },
    ]
  },
];

const mockAddresses: Address[] = [
  {
    id: 'addr_1',
    userId: 'user_1',
    label: 'Home',
    street: '123 East Legon Heights',
    city: 'Accra',
    region: 'Greater Accra',
    ghpost_gps: 'GA-456-789',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'addr_2',
    userId: 'user_2',
    label: 'Office',
    street: '45 Oxford Street',
    city: 'Accra',
    region: 'Greater Accra',
    ghpost_gps: 'GA-123-456',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
];

const mockTasks: EnhancedTask[] = [
  {
    id: 'task_1',
    clientId: 'user_1',
    taskerId: undefined,
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
    client: mockUsers[0],
    category: mockCategories[0],
    address: mockAddresses[0],
    events: [
      {
        id: 'event_1',
        taskId: 'task_1',
        type: 'STATUS_CHANGE',
        payload: { from: null, to: 'CREATED' },
        createdAt: '2024-01-15T08:00:00Z',
      }
    ],
    messages: [],
    reviews: [],
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
    client: mockUsers[1],
    tasker: mockUsers[2],
    category: mockCategories[1],
    address: mockAddresses[1],
    events: [
      {
        id: 'event_2',
        taskId: 'task_2',
        type: 'STATUS_CHANGE',
        payload: { from: 'CREATED', to: 'ASSIGNED' },
        createdAt: '2024-01-17T09:15:00Z',
      }
    ],
    messages: [],
    reviews: [],
  },
  {
    id: 'task_3',
    clientId: 'user_1',
    taskerId: 'tasker_2',
    categoryId: 'cleaning',
    addressId: 'addr_1',
    scheduledAt: '2024-01-16T16:00:00Z',
    durationEstMins: 90,
    status: 'COMPLETED',
    priceGHS: 45,
    platformFeeGHS: 5,
    currency: 'GHS',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-16T17:30:00Z',
    client: mockUsers[0],
    tasker: mockUsers[3],
    category: mockCategories[0],
    address: mockAddresses[0],
    events: [
      {
        id: 'event_3',
        taskId: 'task_3',
        type: 'STATUS_CHANGE',
        payload: { from: 'IN_PROGRESS', to: 'COMPLETED' },
        createdAt: '2024-01-16T17:30:00Z',
      }
    ],
    messages: [
      {
        id: 'msg_1',
        taskId: 'task_3',
        senderId: 'tasker_2',
        messageText: 'Task completed successfully. All areas have been cleaned thoroughly.',
        createdAt: '2024-01-16T17:25:00Z',
        sender: mockUsers[3],
      }
    ],
    reviews: [],
    payment: {
      id: 'payment_1',
      taskId: 'task_3',
      userId: 'user_1',
      amountGHS: 45,
      currency: 'GHS',
      provider: 'paystack',
      providerChargeId: 'ch_test_123456',
      status: 'successful',
      createdAt: '2024-01-16T17:30:00Z',
    }
  },
];

export const useEnhancedTaskStore = create<EnhancedTaskState>()(
  persist(
    (set, get) => ({
      tasks: mockTasks,
      currentTask: null,
      users: mockUsers,
      categories: mockCategories,

      addTask: (taskData) => {
        const newTask: EnhancedTask = {
          ...taskData,
          id: `task_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          events: [{
            id: `event_${Date.now()}`,
            taskId: `task_${Date.now()}`,
            type: 'STATUS_CHANGE',
            payload: { from: null, to: 'CREATED' },
            createdAt: new Date().toISOString(),
          }],
          messages: [],
          reviews: [],
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },

      updateTaskStatus: (id, status, note) => {
        const { updateTask, addTaskEvent } = get();
        
        // Update task status
        updateTask(id, { status });
        
        // Add status change event
        addTaskEvent(id, 'STATUS_CHANGE', { 
          to: status, 
          note: note || `Status changed to ${status}` 
        });
      },

      assignTask: (taskId, taskerId) => {
        const { updateTask, addTaskEvent } = get();
        const tasker = get().users.find(u => u.id === taskerId);
        
        if (tasker) {
          updateTask(taskId, { 
            taskerId, 
            tasker,
            status: 'ASSIGNED' 
          });
          addTaskEvent(taskId, 'TASK_ASSIGNED', { taskerId, taskerName: `${tasker.firstName} ${tasker.lastName}` });
        }
      },

      setCurrentTask: (task) => set({ currentTask: task }),

      getTasksByStatus: (status) => {
        return get().tasks.filter(task => task.status === status);
      },

      getTasksByUser: (userId, role) => {
        return get().tasks.filter(task => 
          role === 'CLIENT' ? task.clientId === userId : task.taskerId === userId
        );
      },

      getAvailableTasks: () => {
        return get().tasks.filter(task => task.status === 'CREATED');
      },

      addTaskEvent: (taskId, type, payload) => {
        const newEvent: TaskEvent = {
          id: `event_${Date.now()}`,
          taskId,
          type,
          payload,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, events: [...task.events, newEvent] }
              : task
          ),
        }));
      },

      addTaskMessage: (taskId, senderId, messageText) => {
        const sender = get().users.find(u => u.id === senderId);
        if (!sender) return;

        const newMessage: TaskMessage = {
          id: `msg_${Date.now()}`,
          taskId,
          senderId,
          messageText,
          createdAt: new Date().toISOString(),
          sender,
        };
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, messages: [...task.messages, newMessage] }
              : task
          ),
        }));
      },

      createPayment: (taskId, userId, amountGHS) => {
        const payment: Payment = {
          id: `payment_${Date.now()}`,
          taskId,
          userId,
          amountGHS,
          currency: 'GHS',
          provider: 'paystack',
          providerChargeId: `ch_test_${Date.now()}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, payment }
              : task
          ),
        }));
      },

      updatePaymentStatus: (taskId, status) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId && task.payment
              ? { 
                  ...task, 
                  payment: { ...task.payment, status }
                }
              : task
          ),
        }));
      },
    }),
    {
      name: 'enhanced-task-storage',
    }
  )
);
