import { create } from 'zustand';

export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'EN_ROUTE' | 'ON_SITE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  role: 'CLIENT' | 'TASKER' | 'ADMIN';
}

export interface Task {
  id: string;
  clientId: string;
  taskerId?: string;
  categoryId: string;
  category: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationEstMins: number;
  status: TaskStatus;
  price: number;
  platformFeeGHS: number;
  location: string;
  address: {
    street: string;
    city: string;
    region: string;
    gpsCode?: string;
  };
  client: User;
  assignedTasker?: User;
  createdAt: string;
  updatedAt: string;
}

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setCurrentTask: (task: Task | null) => void;
  getTasks: (userId: string, role: 'CLIENT' | 'TASKER') => Task[];
  assignTask: (taskId: string, taskerId: string) => void;
}

// Sample mock data
const mockUsers: User[] = [
  {
    id: 'client_1',
    firstName: 'Kwame',
    lastName: 'Asante',
    phone: '+233244123456',
    email: 'kwame@example.com',
    role: 'CLIENT',
  },
  {
    id: 'client_2', 
    firstName: 'Akosua',
    lastName: 'Mensah',
    phone: '+233244234567',
    email: 'akosua@example.com',
    role: 'CLIENT',
  },
  {
    id: 'tasker_1',
    firstName: 'Kofi',
    lastName: 'Osei',
    phone: '+233244345678',
    email: 'kofi@example.com',
    role: 'TASKER',
  },
  {
    id: 'tasker_2',
    firstName: 'Ama',
    lastName: 'Adjei',
    phone: '+233244456789',
    email: 'ama@example.com',
    role: 'TASKER',
  },
];

const mockTasks: Task[] = [
  {
    id: 'task_1',
    clientId: 'client_1',
    taskerId: undefined,
    categoryId: 'cleaning',
    category: 'cleaning',
    title: 'Deep House Cleaning',
    description: 'Need a thorough deep cleaning of my 3-bedroom apartment in East Legon. Kitchen, bathrooms, bedrooms, and living areas.',
    scheduledAt: '2024-01-20T10:00:00Z',
    durationEstMins: 180,
    status: 'OPEN',
    price: 150,
    platformFeeGHS: 15,
    location: 'East Legon, Accra',
    address: {
      street: '123 East Legon Heights',
      city: 'Accra',
      region: 'Greater Accra',
      gpsCode: 'GA-456-789',
    },
    client: mockUsers[0],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'task_2',
    clientId: 'client_2',
    taskerId: 'tasker_1',
    categoryId: 'handyman',
    category: 'handyman',
    title: 'Fix Leaky Faucet',
    description: 'Kitchen faucet has been leaking for a week. Need quick repair.',
    scheduledAt: '2024-01-18T14:00:00Z',
    durationEstMins: 60,
    status: 'ASSIGNED',
    price: 80,
    platformFeeGHS: 8,
    location: 'Osu, Accra',
    address: {
      street: '45 Oxford Street',
      city: 'Accra',
      region: 'Greater Accra',
      gpsCode: 'GA-123-456',
    },
    client: mockUsers[1],
    assignedTasker: mockUsers[2],
    createdAt: '2024-01-16T10:30:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
  },
  {
    id: 'task_3',
    clientId: 'client_1',
    taskerId: 'tasker_2',
    categoryId: 'delivery',
    category: 'delivery',
    title: 'Grocery Shopping & Delivery',
    description: 'Need someone to buy groceries from Shoprite and deliver to my office.',
    scheduledAt: '2024-01-16T16:00:00Z',
    durationEstMins: 90,
    status: 'COMPLETED',
    price: 45,
    platformFeeGHS: 5,
    location: 'Airport Residential, Accra',
    address: {
      street: '78 Airport Hills',
      city: 'Accra',
      region: 'Greater Accra',
      gpsCode: 'GA-789-123',
    },
    client: mockUsers[0],
    assignedTasker: mockUsers[3],
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-16T17:30:00Z',
  },
];

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockTasks,
  currentTask: null,
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
    })),
  setCurrentTask: (task) => set({ currentTask: task }),
  getTasks: (userId, role) => {
    const { tasks } = get();
    return tasks.filter((task) =>
      role === 'CLIENT' ? task.clientId === userId : task.taskerId === userId
    );
  },
  assignTask: (taskId, taskerId) => {
    const tasker = mockUsers.find(u => u.id === taskerId);
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task.id === taskId 
          ? { ...task, taskerId, assignedTasker: tasker, status: 'ASSIGNED' as TaskStatus }
          : task
      ),
    }));
  },
}));